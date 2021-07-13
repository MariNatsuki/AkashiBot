export interface Database {
  shipNameList: {
    normal: ShipNameItem[],
    retrofitted: ShipNameItem[]
  }
}

interface ShipNameItem {
  name: string
  normalized: string
  alias?: string[]
}
