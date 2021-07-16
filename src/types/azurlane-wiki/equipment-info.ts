export interface EquipmentInfo {
  name: string
  url: string
  description: string
  images: Images
  tiers: Tier[]
  nationality: string
}

interface Images {
  icon?: string,
  pattern?: string
}

export interface Tier {
  rarity: string,
  stars?: string
}
