export interface BarrageInfo {
  name: string
  ship: Ship
  icon: string
  image: string
  rounds: Round[]
}

export interface Ship {
  name: string
  url: string
}

export interface Round {
  type: string
  dmgL: number
  dmgM: number
  dmgH: number
  note: string
}
