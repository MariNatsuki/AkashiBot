import { RARITY_HEX_MAP } from '../constants/wiki.constant'
import { Equipment, Skill } from '../types/azurlane-wiki'
import { LinkType, TemplateTitle } from '../types/wiki'
import { ParseWikitextOptions, WikitextParserOptionsType } from '../types/formatter/formatter'
import { generateWikitextParseOptions } from '../utils/formatter'
import cejs = require('cejs')

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

export function extractEquipmentsFromInfo(shipInfo: any): Equipment[] {
  const result: Equipment[] = []
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

export function extractSkillsFromInfo(shipInfo: any, images = {}): Skill[] {
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

export function parseInfoFromWikitext(wikitext: string, options?: ParseWikitextOptions): Record<string, any> {
  const data = {}
  const parsed = cejs.wiki.parser(wikitext)
  parsed.each('template', token => {
    data[token.name] = data[token.name] || {}
    for (const [key, value] of Object.entries(token.parameters)) {
      data[token.name][key] = convertWikitextValue(
        value, { ...generateWikitextParseOptions(WikitextParserOptionsType.Default), ...options }
      ).trim()
    }
  })

  return data
}

function convertWikitextValue(value: any, options: ParseWikitextOptions): string {
  switch (typeof value) {
    case 'string':
      return value
    case 'object':
      let parsed
      switch (value.type) {
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
