import { Logger } from '../utils/logger'
import config from 'config'
import { Wiki } from '../core/wiki'
import { ShipInfo, ShipList, Skill } from '../types/azurlane-wiki'
import {
  convertShipRarityToStars,
  extractEquipmentsFromInfo,
  extractShipImagesFromWikiImages,
  extractSkillImagesFromWikiImages,
  extractSkillsFromInfo,
  extractStatsFromInfo,
  formatShipDataFromDatabase,
  parseInfoFromWikitext
} from '../helpers/wiki.helper'
import {
  searchShip as searchShipInDatabase,
  getShip as getShipFromDatabase
} from '../core/database'
import { ParseWikitextOptions } from '../types/formatter'
import HeaderGenerator = require('header-generator')
import { parse } from 'node-html-parser'
import { ShipListNormalGroupTemplate, ShipListRetrofittedTemplate } from '../constants/azurlane-wiki.constant'

const logger = new Logger('AzurLaneWikiModule')

const wiki = Wiki({
  apiUrl: config.get('Wiki.Detail.url.api'),
  headers: new HeaderGenerator({
    browsers: [
      { name: 'firefox', minVersion: 80 },
      { name: 'chrome', minVersion: 87 },
      'safari'
    ],
    devices: [
      'desktop'
    ],
    operatingSystems: [
      'windows'
    ]
  }).getHeaders()
})

export async function getShipList(): Promise<ShipList> {
  try {
    const shipList: ShipList = {
      normal: [],
      retrofitted: []
    }
    await Promise.all([...Object.keys(ShipListNormalGroupTemplate).map(
      template => fetchShipListFromWiki(ShipListNormalGroupTemplate[template], shipList.normal)
    ), fetchShipListFromWiki(ShipListRetrofittedTemplate.RetrofittedShips, shipList.retrofitted)])
    return shipList
  }
  catch (e) {
    logger.error('Fetching Ship List encountered an error', e.stack)
    return {
      normal: [],
      retrofitted: []
    }
  }
}

async function fetchShipListFromWiki(templateType: string, outputArray?: string[]) {
  const resultArray = outputArray || []
  return wiki.api({
    action: 'expandtemplates',
    text: templateType,
    prop: 'wikitext'
  }).then(result => parse(result.expandtemplates.wikitext)
    .querySelectorAll('tr td:nth-child(1)')
    .forEach(item => {
      const matched = item.innerText.match(/^\[\[(.*?)\|[a-zA-Z0-9]*]]$/)
      if (matched) resultArray.push(matched[1])
    }))
}

export async function findShip(shipName: string, options?: ParseWikitextOptions): Promise<ShipInfo> {
  try {
    const search = await searchShipInDatabase(shipName)
    if (!search) {
      return null
    }

    return formatShipDataFromDatabase(await getShipFromDatabase(search)) || getShipFromWiki(search, options)
  } catch (e) {
    logger.error('Finding Ship encountered an error', e.stack)
    return null
  }
}

async function getShipFromWiki(shipName: string, options: ParseWikitextOptions): Promise<ShipInfo> {
  const page = await wiki.find(shipName)
  const name = page.raw.title
  const url = page.raw.fullurl

  const [info, images] = await Promise.all([
    page.rawInfo().then(rawInfo => parseInfoFromWikitext(rawInfo, options)),
    page.rawImages()
  ])
  const shipInfo = info.Ship
  const shipImages = extractShipImagesFromWikiImages(name, images)
  const skillImages =  extractSkillImagesFromWikiImages(images)

  return {
    name,
    url,
    description: '',
    va: shipInfo.VA,
    artist: {
      name: shipInfo.Artist,
      link: shipInfo.ArtistLink,
      pixiv: shipInfo.ArtistPixiv,
      twitter: shipInfo.ArtistTwitter
    },
    images: shipImages,
    rarity: {
      name: shipInfo.Rarity,
      stars: convertShipRarityToStars(shipInfo.Rarity)
    },
    nationality: shipInfo.Nationality,
    shipType: shipInfo.Type,
    class: shipInfo.Class,
    stats: extractStatsFromInfo(shipInfo),
    equipments: extractEquipmentsFromInfo(shipInfo),
    skills: extractSkillsFromInfo(shipInfo, skillImages)
  }
}

export async function findSkill(shipName: string, options?: ParseWikitextOptions): Promise<Skill[]> {
  try {
    const search = await searchShip(shipName)
    if (!search) {
      return null
    }
    const page = await wiki.find(search)

    const [info, skillImages] = await Promise.all([
      page.rawInfo().then(rawInfo => parseInfoFromWikitext(rawInfo, options)),
      page.rawImages().then(images => extractSkillImagesFromWikiImages(images))
    ])

    return extractSkillsFromInfo(info.Ship, skillImages)
  } catch (e) {
    logger.error('Finding Skill encountered an error', e.stack)
    return null
  }
}

async function searchShip(shipName: string) {
  let search = await wiki.search(`intitle:${shipName.replace(/[^a-zA-Z0-9]/g, '_')}* incategory:Ships`)
  if (!search.results.length) {
    search = await wiki.search(`intitle:${shipName.replace(/[^a-zA-Z0-9]/g, '*')}* incategory:Ships`)
  }
  if (!search.results.length) {
    return null
  }
  return search.results[0]
}
