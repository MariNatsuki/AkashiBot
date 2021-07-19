export interface EquipmentInfo {
  name: string
  url: string
  description: string
  images: Images
  tiers: Tier[]
  type: string
  nationality: string
  obtain: string
}

export interface Images {
  icon?: string,
  pattern?: string
}

export interface Tier {
  rarity: Rarity
  stats: Stat[]
}

interface Rarity {
  name: string
  stars?: string
}

interface Stat {
  [name: string]: string
}
