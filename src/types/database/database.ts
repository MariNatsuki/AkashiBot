export interface Database {
  shipNameList: {
    normal: ShipNameItem[],
    retrofitted: ShipNameItem[]
  },
  equipmentNameList: string[]
}

interface ShipNameItem {
  name: string
  normalized: string
  alias?: string[]
}
