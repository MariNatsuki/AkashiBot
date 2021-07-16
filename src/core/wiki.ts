import WikiJs from 'wikijs'
import { WikiArguments, Wiki } from '../types/wiki'

export function Wiki(options?: WikiArguments[0]): Wiki {
  function wikitext(page: string): Promise<string> {
    return this.api({
      action: 'parse',
      page,
      prop: 'wikitext',
      format: 'json',
      formatversion: '2'
    }).then(result => result?.parse?.wikitext)
  }
  function findImages(page: string, images?: string[]): Promise<Record<string, any>[]> {
    return this.api({
      action: 'query',
      titles: page,
      prop: 'imageinfo',
      iiprop: 'url',
      generator: 'images',
      gimlimit: 'max',
      gimimages: images ? images.join('|') : '',
      format: 'json',
      formatversion: '2'
    }).then(result => result?.query?.pages)
  }
  function findImagesAlt(page: string, images?: string[]): Promise<Record<string, any>[]> {
    return this.api({
      action: 'query',
      titles: page,
      prop: 'imageinfo',
      iiprop: 'url',
      generator: 'links',
      gplnamespace: '6',
      gpllimit: 'max',
      gpltitles: images ? images.join('|') : '',
      format: 'json',
      formatversion: '2'
    }).then(result => result?.query?.pages)
  }
  return { ...WikiJs(options), wikitext, findImages, findImagesAlt }
}
