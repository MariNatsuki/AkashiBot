export enum CATEGORY {
  SHIPS = 'Ships'
}

export const RARITY_HEX_MAP = {
  'Decisive': '#E91E63',
  'Ultra Rare': '#E91E63',
  'Priority': '#F1C40F',
  'Super Rare': '#F1C40F',
  'Elite': '#9B59B6',
  'Rare': '#3498DB',
  'Normal': '#95A5A6'
}

export enum ShipListNormalGroupTemplate {
  StandardList = '{{ShipList|group1=Standard|group2=Child}}',
  ResearchShips = '{{ShipList|group1=Research}}',
  METAShips = '{{ShipList|group1=META}}',
  CollabShips = '{{ShipList|group1=Collab}}'
}

export enum ShipListRetrofittedTemplate {
  RetrofittedShips = '{{ShipList|remodel=1}}'
}

export enum ShipRarityStars {
  Decisive = '★★★★★★',
  UltraRare = '★★★★★★',
  Priority = '★★★★★★',
  SuperRare = '★★★★★★',
  Elite = '★★★★★',
  Rare = '★★★★',
  Normal = '★★★'
}
