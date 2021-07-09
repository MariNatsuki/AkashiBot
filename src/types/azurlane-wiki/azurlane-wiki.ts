export type ShipInfo = {
  name: string
  url: string
  description: string
  images: { icon?: string, portrait?: string }
  va: string
  artist: {
    name: string,
    link: string,
    pixiv: string,
    twitter: string
  }
  rarity: string
  nationality: string
  shipType: string
  class: string
  armor: string
  equipments: Equipment[]
  skills: Skill[]
}

export type Equipment = {
  type: string
  quantity: string
  efficiencyMin: string
  efficiencyMax: string
}

export type Skill = {
  name: string
  type?: string
  description?: string
  image?: string
}
