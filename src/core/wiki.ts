import WikiJs from 'wikijs'
import { WikiArguments, Wiki } from '../types/wiki'

export function Wiki(options?: WikiArguments[0]): Wiki {
  return WikiJs(options)
}
