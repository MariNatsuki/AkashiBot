export interface BarrageInfo {
  name: string
  ship: string
  icon: string
  image: string
  rounds: Round[]
}

export interface Round {
  type: string
  dmgL: number
  dmgM: number
  dmgH: number
  note: string
}
