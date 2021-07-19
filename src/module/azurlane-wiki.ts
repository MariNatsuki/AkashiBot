import { Logger } from '../utils/logger'
import config from 'config'
import { Wiki } from '../core/wiki'
import { EquipmentInfo, ShipInfo, ShipList } from '../types/azurlane-wiki'
import {
  convertShipRarityToStars,
  extractBarrageRoundInfoFromWikiBarrage,
  extractEquipmentImagesFromWikiImages,
  extractEquipmentsFromInfo,
  extractShipImagesFromWikiImages,
  extractSkillImagesFromWikiImages,
  extractSkillsFromInfo,
  extractStatsFromInfo,
  formatBarrageDataFromDatabase,
  formatBarrageIconFileName,
  formatBarrageImageFileName,
  formatEquipmentDataFromDatabase,
  formatShipDataFromDatabase, generatePageUrlFromPageName,
  parseInfoFromWikitext
} from '../helpers/wiki.helper'
import {
  searchShip as searchShipInDatabase,
  getShip as getShipFromDatabase,
  getBarrage as getBarrageFromDatabase,
  searchEquipment as searchEquipmentFromDatabase,
  getEquipment as getEquipmentFromDatabase,
} from '../core/database'
import { ParseWikitextOptions } from '../types/formatter'
import HeaderGenerator = require('header-generator')
import { parse } from 'node-html-parser'
import { ShipListNormalGroupTemplate, ShipListRetrofittedTemplate } from '../constants/azurlane-wiki.constant'
import { BarrageInfo } from '../types/azurlane-wiki'

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

export async function getEquipmentList(): Promise<string[]> {
  return wiki.pagesInCategory('Category:Equipment')
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
    va: {
      name: shipInfo.VA.text,
      url: shipInfo.VA.url
    },
    artist: {
      name: shipInfo.Artist,
      link: shipInfo.ArtistLink,
      pixiv: shipInfo.ArtistPixiv.url,
      twitter: shipInfo.ArtistTwitter.url
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

export async function findBarrage(shipName: string, options?: ParseWikitextOptions): Promise<BarrageInfo[]> {
  const search = await searchShipInDatabase(shipName)
  if (!search) {
    return null
  }

  const barrageInfoFromDatabase = (await getBarrageFromDatabase(search)).map(barrage => formatBarrageDataFromDatabase(search, barrage))

  return barrageInfoFromDatabase.length ? barrageInfoFromDatabase : getBarrageFromWiki(search, options)
}

async function getBarrageFromWiki(shipName: string, options: ParseWikitextOptions): Promise<BarrageInfo[]> {
  const barrages = parseInfoFromWikitext(await wiki.wikitext('Barrage'), options).BarrageList
  if (Array.isArray(barrages)) {
    const founds = barrages.filter(barrage => Array.isArray(barrage.Ships) ? barrage.Ships.find(info => info.text === shipName) : barrage.Ships.text === shipName)
    if (founds) {
      let iconFileList = []
      let imageFileList = []
      founds.forEach(barrage => {
        iconFileList = [...iconFileList, formatBarrageIconFileName(barrage.SkillIcon)]
        imageFileList = [...imageFileList, formatBarrageImageFileName(barrage.GifID)]
      })
      await Promise.all([
        wiki.findImages('Barrage', iconFileList).then(results => results.forEach(
          result => founds.forEach(
            barrage => formatBarrageIconFileName(barrage.SkillIcon) === result.title ? barrage.IconUrl = result.imageinfo[0]?.url : ''
          )
        )),
        wiki.findImagesAlt('Barrage', imageFileList).then(results => results.forEach(
          result => founds.forEach(
            barrage => formatBarrageImageFileName(barrage.GifID) === result.title ? barrage.ImageUrl = result.imageinfo[0]?.url : ''
          )
        ))
      ])

      return founds.map(barrage => {
        const ship = Array.isArray(barrage.Ships) ? barrage.Ships.find(shp => shp.text === shipName) : barrage.Ships
        return {
          name: barrage.Name,
          ship: {
            name: ship.text,
            url: ship.url
          },
          icon: barrage.IconUrl,
          image: barrage.ImageUrl,
          rounds: extractBarrageRoundInfoFromWikiBarrage(barrage),
        }
      })
    }
  }

  return []
}

export async function findEquipment(equipmentName: string, options?: ParseWikitextOptions): Promise<EquipmentInfo> {
  const search = searchEquipmentFromDatabase(equipmentName)

  if (!search) {
    return null
  }

  return getEquipmentFromWiki(search, options)

  return formatEquipmentDataFromDatabase(await getEquipmentFromDatabase(search))
}

async function getEquipmentFromWiki(equipmentName: string, options?: ParseWikitextOptions): Promise<EquipmentInfo> {
  const [parsed, images] = await Promise.all([
    wiki.wikitext(equipmentName).then(result => parseInfoFromWikitext(result, options)),
    wiki.findImages(equipmentName)
  ])
  const equipments = parsed?.Equipment ? (Array.isArray(parsed.Equipment) ? parsed.Equipment : [parsed.Equipment]) : null
  if (!equipments.length) {
    return null
  }
  return {
    name: equipments[0].Name,
    url: generatePageUrlFromPageName(equipmentName),
    description: '',
    images: extractEquipmentImagesFromWikiImages(images, equipments[0].Image, equipments[0].BulletPattern),
    tiers: [],
    type: '',
    nationality: '',
    obtain: ''
  }
}
