import { Logger } from '../utils/logger'
import config from 'config'
import { Wiki } from '../core/wiki'
import { ShipInfo, Skill } from '../types/azurlane-wiki'
import {
  extractEquipmentsFromInfo,
  extractShipImagesFromWikiImages,
  extractSkillImagesFromWikiImages,
  extractSkillsFromInfo,
  parseInfoFromWikitext
} from '../helpers/wiki.helper'
import { ParseWikitextOptions } from '../types/formatter/formatter'
import HeaderGenerator = require('header-generator')

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

export async function findShip(shipName: string, options?: ParseWikitextOptions): Promise<ShipInfo> {
  try {
    const search = await searchShip(shipName)
    if (!search) {
      return null
    }

    const page = await wiki.find(search)
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
      rarity: shipInfo.Rarity,
      nationality: shipInfo.Nationality,
      shipType: shipInfo.Type,
      class: shipInfo.Class,
      armor: shipInfo.Armor,
      equipments: extractEquipmentsFromInfo(shipInfo),
      skills: extractSkillsFromInfo(shipInfo, skillImages)
    }
  } catch (e) {
    logger.error('Finding Ship encountered an error', e.stack)
    return null
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
