export interface ShipInfo {
  name: string
  url: string
  description: string
  images: Images
  va: VA
  artist: Artist
  rarity: Rarity
  nationality: string
  shipType: string
  class: string
  stats: Stats
  equipments: Equipment[]
  skills: Skill[]
}

export interface Images {
  icon?: string,
  portrait?: string
}

export interface VA {
  name: string,
  url: string
}

export interface Artist {
  name: string,
  link: string,
  pixiv?: string,
  twitter?: string
}

export interface Rarity {
  name: string,
  stars?: string
}

export interface Stats {
  health: string
  armor: string
  reload: string
  luck: string
  firepower: string
  torpedo: string
  evasion: string
  speed: string
  antiAir: string
  aviation: string
  oilConsumption: string
  accuracy: string
  aSW: string
  oxygen: string
  ammunition: string
  huntingRange: string
}

export interface Skill {
  name: string
  type?: string
  description?: string
  image?: string
}

export interface Equipment {
  type: string
  quantity: string
  efficiencyMin: string
  efficiencyMax: string
}
