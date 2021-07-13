import latinize from 'latinize'

latinize.characters = {
  ...latinize.characters,
  'µ': 'mu'
}

export function normalizeShipName(shipName: string): string {
  return latinize(shipName)
}
