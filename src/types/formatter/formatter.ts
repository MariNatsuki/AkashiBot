import { LinkType } from '../wiki'

export enum WikitextParserOptionsType {
  Default = 'default',
  Discord = 'discord'
}

export interface ParseWikitextOptions {
  formatLink?: (text: string, url: string, type?: LinkType) => any
  formatNotation?: (text: string, notation: string) => any
}

