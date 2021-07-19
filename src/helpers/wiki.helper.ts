import cejs = require('cejs')
import config from 'config'
import { RARITY_HEX_MAP, ShipRarityStars } from '../constants/azurlane-wiki.constant'
import { Equipment as ShipEquipment, Images, Round, ShipInfo, Skill, Stats } from '../types/azurlane-wiki'
import { LinkType, TemplateTitle } from '../types/wiki'
import { ParseWikitextOptions, WikitextParserOptionsType } from '../types/formatter'
import { generateWikitextParseOptions } from '../utils/formatter'
import { BarrageInfo } from '../types/azurlane-wiki'
import { Ship } from '@azurapi/azurapi/build/types/ship'
import { SkillType } from '../constants/emoji.constants'
import { SkillColorToTypeMap } from '../constants/database.constant'
import { Barrage } from '@azurapi/azurapi/build/types/barrage'
import { EquipmentInfo } from '../types/azurlane-wiki'
import { Equipment } from '@azurapi/azurapi/build/types/equipment'

cejs.run('application.net.wiki')

export function matchShipWithIcon(shipName: string, imageName: string): boolean {
  return new RegExp(`^(File:${shipName}Icon).((png)|(jpg))$`).test(imageName)
}

export function matchShipWithPortrait(shipName: string, imageName: string): boolean {
  return new RegExp(`^(File:${shipName}).((png)|(jpg))$`).test(imageName)
}

export function matchSkillImageId(imageName: string): string {
  const match = imageName.match(/^File:Skill(.*?).png|jpg$/)
  return match ? match[1].trim() : null
}

export function extractShipImagesFromWikiImages(name: string, images: any[]): { icon?: string, portrait?: string } {
  return images.reduce((accumulator, currentImage) => {
    const imageUrl = (currentImage.imageinfo[0] as any).url
    if (matchShipWithIcon(name, currentImage.title)) {
      accumulator.icon = imageUrl
    } else if (matchShipWithPortrait(name, currentImage.title)) {
      accumulator.portrait = imageUrl
    }
    return accumulator
  }, {})
}

export function extractEquipmentImagesFromWikiImages(images: Record<string, any>, icon: string, pattern: string): Images {
  const result: Images = {
    icon: null,
    pattern: null
  }
  images.every(image => {
    if (image.title.match(`/^File:${icon}$/`)) {
      result.icon = image.imageinfo[0].url
    }
    if (image.title.match(`/^File:Bullet pattern equip ${pattern}.gif$/`)) {
      result.pattern = image.imageinfo[0].url
    }
    return !result.icon || !result.pattern
  })
  return result
}

export function extractStatsFromInfo(shipInfo: Record<string, any>): Stats {
  return {
    health: shipInfo['Health120'],
    armor: shipInfo['Armor'],
    reload: shipInfo['Reload120'],
    luck: shipInfo['Luck'],
    firepower: shipInfo['Fire120'],
    torpedo: shipInfo['Torp120'],
    evasion: shipInfo['Evade120'],
    speed: shipInfo['Speed'],
    antiAir: shipInfo['AA120'],
    aviation: shipInfo['Air120'],
    oilConsumption: shipInfo['Consumption120'],
    accuracy: shipInfo['Acc120'],
    aSW: shipInfo['ASW120'],
    oxygen: shipInfo['Oxygen'],
    ammunition: shipInfo['Ammo'],
    huntingRange: shipInfo['Range'],
  }
}

export function extractEquipmentsFromInfo(shipInfo: Record<string, any>): ShipEquipment[] {
  const result: ShipEquipment[] = []
  if (typeof shipInfo !== 'object') return result
  let count = 1
  while (shipInfo[`Eq${count}Type`]) {
    result.push({
      type: shipInfo[`Eq${count}Type`],
      quantity: shipInfo[`Eq${count}BaseMax`],
      efficiencyMin: shipInfo[`Eq${count}EffInit`],
      efficiencyMax: shipInfo[`Eq${count}EffInitMax`],
    })
    count++
  }
  return result
}

export function extractSkillsFromInfo(shipInfo: Record<string, any>, images = {}): Skill[] {
  const result: Skill[] = []
  if (typeof shipInfo !== 'object') return result
  let count = 1
  while (shipInfo[`Skill${count}`]) {
    result.push({
      name: shipInfo[`Skill${count}`],
      type: shipInfo[`Type${count}`],
      description: shipInfo[`Skill${count}Desc`],
      ...(images[shipInfo[`Skill${count}Icon`]] && { image: images[shipInfo[`Skill${count}Icon`]] })
    })
    count++
  }
  return result
}

export function extractSkillImagesFromWikiImages(images: any[]): { [imageId: string]: string } {
  return images.reduce((accumulator, currentImage) => {
    const imageUrl = (currentImage.imageinfo[0] as any).url
    const skillId = matchSkillImageId(currentImage.title)
    if (skillId) {
      accumulator[skillId] = imageUrl
    }
    return accumulator
  }, {})
}

export function extractBarrageRoundInfoFromWikiBarrage(barrage: Record<string, any>): Round[] {
  const result: Round[] = []
  Object.keys(barrage).forEach(key => {
    const match = key.match(/^Dmg\d*Type$/)
    if (match) {
      const index = match[1] ? parseInt(match[1].trim()) : ''
      const resultIndex = index ? index - 1 : 0
      result[resultIndex] = {
        type: barrage[key],
        dmgL: parseInt(barrage[`Dmg${index}L`]),
        dmgM: parseInt(barrage[`Dmg${index}M`]),
        dmgH: parseInt(barrage[`Dmg${index}H`]),
        note: barrage[`Notes${index}`]
      }
    }
  })
  return result
}

export function formatBarrageIconFileName(id: string) {
  return `File:Skill ${id}.png`
}

export function formatBarrageImageFileName(id: string) {
  return `File:Bullet pattern skill ${id}.gif`
}

export function generatePageUrlFromPageName(name: string): string {
  return `${config.get('Wiki.Detail.url.main').replace(new RegExp('[/]+$'), '')}/${name}`
}

export function generateWikipediaUrlFromPageName(name: string): string {
  return `${config.get('Wiki.Others.Wikipedia.url').replace(new RegExp('[/]+$'), '')}/${name}`
}

export function parseInfoFromWikitext(wikitext: string, options?: ParseWikitextOptions): Record<string, any> {
  const data = {}
  const parsed = cejs.wiki.parser(wikitext)
  parsed.each('template', token => {
    const content = {}
    for (const [key, value] of Object.entries(token.parameters)) {
      content[key] = convertWikitextValue(value, { ...generateWikitextParseOptions(WikitextParserOptionsType.Default), ...options })
    }
    data[token.name] = data[token.name] ? [...(Array.isArray(data[token.name]) ? data[token.name] : [data[token.name]]), content] : content
  })
  return data
}

function convertWikitextValue(value: any, options: ParseWikitextOptions): string {
  switch (typeof value) {
    case 'string':
      return value.trim()
    case 'object':
      let parsed
      switch (value.type) {
        case 'plain':
          return value.reduce((result: string | any[], item, index) => {
            if (typeof value[index + 1] === 'string' && typeof item === 'object') {
              if (value[index + 1].trim() !== ',') {
                item.extra_text = value[index + 1].replace(/,\s*$/, '')
              }
              value[index + 1] = ''
            }
            const convertedValue = convertWikitextValue(item, options)
            if (convertedValue) {
              result = result ? [...(Array.isArray(result) ? result : [result]), convertedValue] : convertedValue
            }
            return result
          }, null)
        case 'comment':
          break
        case 'link':
          parsed = parseLink(value)
          return options.formatLink(parsed.text, encodeURI(parsed.url), parsed.type)
        case 'external_link':
          parsed = parseExternalLink(value)
          return options.formatLink(parsed.text, encodeURI(parsed.url), LinkType.External)
        case 'transclusion':
          if (value.page_title === TemplateTitle.Tooltip) {
            parsed = parseTooltip(value)
            return options.formatNotation(parsed.text, parsed.tooltip)
          }
        default:
          return value.map(val => convertWikitextValue(val, options)).join('')
      }

      return ''
  }
}

function parseLink(value: any): { text: string, url: string, type: LinkType } {
  let text = value.display_text || ''
  let url = ''
  let type = LinkType.Internal
  value.forEach(val => {
    if (typeof val === 'string') {
      if (!value.display_text) {
        text += val
      }
      return
    }
    if (typeof val === 'object' && val.type === 'namespaced_title') {
      val.forEach(v => {
        switch (v) {
          case 'wikipedia':
            type = LinkType.Wikipedia
            break
          default:
            url += v
        }
      })
    }
  })
  return { text: text.trim() || url.trim(), url: url.trim(), type }
}

function parseExternalLink(value: any): { text: string, url: string } {
  let text = ''
  let url = ''
  value.forEach(val => {
    if (typeof val === 'string') {
      text += val
      return
    }
    if (typeof val === 'object' && val.type === 'url') {
      url += val.join('')
    }
  })
  return { text: text.trim(), url: url.trim() }
}

function parseTooltip(value: any): { text: string, tooltip: string } {
  let text = ''
  let tooltip = ''
  if (value.parameters) {
    text = value.parameters['1'] || text
    tooltip = value.parameters['2'] || tooltip
  }
  return { text: text.trim(), tooltip: tooltip.trim() }
}

export function convertRarityToColor(rarity: string): string {
  return RARITY_HEX_MAP[rarity] || '#000000'
}

export function formatShipDataFromDatabase(data: Ship): ShipInfo {
  return data ? {
    name: data.names.en,
    url: data.wikiUrl,
    description: '',
    va: {
      name: data.misc.voice?.name,
      url: data.misc.voice?.url,
    },
    artist: {
      name: data.misc?.artist?.name,
      link: data.misc?.artist?.url,
      pixiv: data.misc?.pixiv?.url,
      twitter: data.misc?.twitter?.url
    },
    images: {
      icon: data.thumbnail,
      portrait: data.skins[0]?.image
    },
    rarity: {
      name: data.rarity,
      stars: data.stars?.stars
    },
    nationality: data.nationality,
    shipType: data.hullType,
    class: data.class,
    stats: extractStatsFromDatabase(data),
    equipments: extractEquipmentsFromDatabase(data),
    skills: extractSkillsFromDatabase(data)
  } : null
}

function extractStatsFromDatabase(data: Ship): Stats {
  const stats = data.stats.level120
  return {
    health: stats['health'],
    armor: stats['armor'],
    reload: stats['reload'],
    luck: stats['luck'],
    firepower: stats['firepower'],
    torpedo: stats['torpedo'],
    evasion: stats['evasion'],
    speed: stats['speed'],
    antiAir: stats['antiair'],
    aviation: stats['aviation'],
    oilConsumption: stats['oilConsumption'],
    accuracy: stats['accuracy'],
    aSW: stats['antisubmarineWarfare'],
    oxygen: stats['oxygen'],
    ammunition: stats['ammunition'],
    huntingRange: stats['huntingRange'],
  }
}

function extractEquipmentsFromDatabase(data: Ship): ShipEquipment[] {
  return data.slots.map(slot => ({
    type: slot?.type,
    efficiencyMin: slot?.minEfficiency?.toString(),
    efficiencyMax: slot?.maxEfficiency?.toString(),
    quantity: slot['max']
  }))
}

function extractSkillsFromDatabase(data: Ship): Skill[] {
  return data.skills.map(skill => ({
    name: skill?.names?.en,
    type: mapSkillColorWithType(skill?.color),
    description: skill?.description,
    image: skill?.icon
  }))
}

export function formatEquipmentDataFromDatabase(data: Equipment): EquipmentInfo {
  return data ? {
    name: data['id'],
    url: data['wikiUrl'],
    description: '',
    images: {
      icon: data['image'],
      pattern: data['misc']?.animation
    },
    tiers: data['tiers']?.reduce((result, tier) => {
      if (tier) {
        const out = {
          rarity: {
            name: tier.rarity,
            stars: tier.stars.stars
          },
          stats: {}
        }
        for (const name in tier.stats) {
          out.stats[name] = tier.stats[name].type === 'more_stats' ?
            tier.stats[name].stats?.reduce((out, stat) => `${out}\n${stat.formatted}`, '')?.trim() :
            tier.stats[name].formatted
        }
        result.push(out)
      }
      return result
    }, []),
    type: data['category'],
    nationality: data['nationality'],
    obtain: data['misc']['obtainedFrom']
  } : null
}

function mapSkillColorWithType(color: string): SkillType {
  return SkillColorToTypeMap[color]
}

export function formatBarrageDataFromDatabase(ship: string, data: Barrage): BarrageInfo {
  return {
    name: data['name'],
    ship: {
      name: ship,
      url: generatePageUrlFromPageName(ship)
    },
    icon: data['icon'],
    image: data['image'],
    rounds: data['rounds'],
  }
}

export function convertShipRarityToStars(rarity: string): ShipRarityStars {
  return ShipRarityStars[rarity.replace(/ /g, '')]
}
