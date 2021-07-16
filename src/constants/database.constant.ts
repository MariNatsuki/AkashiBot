import { Database } from '../types/database'
import { SkillType } from './emoji.constants'

export const DefaultDatabase: Database = {
  shipNameList: {
    normal: [],
    retrofitted: []
  },
  equipmentNameList: []
}

export const SkillColorToTypeMap = {
  'pink': SkillType.Offense,
  'deepskyblue': SkillType.Defense,
  'gold': SkillType.Support
}
