import { Logger } from '../utils/logger'
import config from 'config'
import { Wiki } from '../core/wiki'
import { ShipInfo } from '../types/azurlane-wiki'
import {
  extractEquipmentsFromInfo,
  extractImagesFromWikiImages,
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
    const search = await wiki.search(`intitle:*${shipName}* incategory:Ships`)
    if (!search.results.length) {
      return null
    }

    const page = await wiki.find(search.results[0])
    const name = page.raw.title
    const url = page.raw.fullurl

    const [info, imageUrls] = await Promise.all([
      page.rawInfo().then(rawInfo => parseInfoFromWikitext(rawInfo, options)),
      page.rawImages().then(images => extractImagesFromWikiImages(name, images))
    ])

    return {
      name,
      url,
      description: '',
      va: info.vA,
      artist: info.artistLink,
      images: imageUrls,
      rarity: info.rarity,
      nationality: info.nationality,
      shipType: info.type,
      class: info.class,
      armor: info.armor,
      equipments: extractEquipmentsFromInfo(info),
      skills: extractSkillsFromInfo(info)
    }
  } catch (e) {
    logger.error('Finding Ship encountered an error', e.stack)
    return null
  }
}
