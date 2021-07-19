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

export const STATS_PROPERTIES_FIELD_NAME_MAP = {
  // Guns
  firepower: 'Firepower',
  antiair: 'Anti Air',
  volley: 'Volley',
  volleyTime: 'Volley Time',
  coefficient: 'Coefficient',

  // Planes
  aviation: 'Aviation',
  planeHealth: 'Plane Health',
  speed: 'Speed',
  dodgeLimit: 'Dodge Limit',
  crashDamage: 'Crash Damage',
  aAGuns: 'AA Guns',
  ordnance: 'Ordnance',

  // Commons
  damage: 'Damage',
  rateOfFire: 'Rate of Fire',
  noOfTorpedoes: 'No. of Torpedoes',
  spread: 'Spread',
  angle: 'Angle',
  range: 'Range',
  ammoType: 'Ammo Type',
  characteristic: 'Characteristic',
}
