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
  armor: string
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
