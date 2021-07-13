import config from 'config'
import { ParseWikitextOptions, WikitextParserOptionsType } from '../types/formatter'
import { LinkType } from '../types/wiki'
import { Url } from '../types/formatter'

export function generateWikitextParseOptions(type: WikitextParserOptionsType): ParseWikitextOptions {
  switch (type) {
    case WikitextParserOptionsType.Default:
      return defaultParseWikitextOptions
    case WikitextParserOptionsType.Discord:
      return discordParseWikitextOptions
  }
}

const defaultParseWikitextOptions: ParseWikitextOptions = {
  formatLink(text: string, url: string, type?: LinkType): string {
    return text
  },
  formatNotation(text: string, notation: string): string {
    return `${text} (${notation})`
  }
}

const discordParseWikitextOptions: ParseWikitextOptions = {
  formatLink(text: string, outputUrl: string, type?: LinkType): Url {
    const url = (() => {
      switch (type) {
        case LinkType.Internal:
          return `${config.get('Wiki.Detail.url.main').replace(new RegExp('[/]+$'), '')}/${outputUrl}`
        case LinkType.Wikipedia:
          return `${config.get('Wiki.Others.Wikipedia.url').replace(new RegExp('[/]+$'), '')}/${outputUrl}`
        default:
          return outputUrl
      }
    })()
    return { text, url }
  },
  formatNotation(text: string, notation: string) {
    return `__${text}__ \`${notation}\``
  }
}
