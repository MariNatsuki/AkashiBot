export class List<ItemType> {
  private iterator = 0
  private readonly items: ItemType[] = []
  private aliasKeyMap: { [alias: string]: number } = {}
  private keyAliasMap: { [key: number]: string } = {}

  constructor(items?: ItemType[] | Record<string, ItemType>) {
    if (Array.isArray(items)) {
      this.items = items.map(item => item)
      return
    }
    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        const lastKey = this.items.push(items[key]) - 1
        this.addAlias(key, lastKey)
      }
    }
  }

  addPage(item: ItemType, alias?: string): List<ItemType> {
    const index = this.items.push(item) - 1
    if (alias) {
      this.addAlias(alias, index)
    }
    return this
  }

  currentPage(): ItemType {
    return this.items[this.iterator]
  }

  nextPage(): ItemType {
    return this.items[this.moveIterator(1)]
  }

  previousPage(): ItemType {
    return this.items[this.moveIterator(-1)]
  }

  goToPage(index: number): ItemType {
    return this.items[this.setIterator(index)]
  }

  goToPageByAlias(alias: string): ItemType {
    return this.items[this.setIterator(this.aliasKeyMap[alias])]
  }

  getPageByAlias(alias: string): ItemType {
    if (this.aliasKeyMap[alias] === undefined) return null
    return this.items[this.aliasKeyMap[alias]]
  }

  each(callback: (value: ItemType, index: number, alias: string) => void): void {
    return this.items.forEach((item, key) => callback(item, key, this.keyAliasMap[key]))
  }

  private addAlias(alias: string, key: number) {
    this.aliasKeyMap[alias] = key
    this.keyAliasMap[key] = alias
  }

  private moveIterator(step: number): number {
    this.iterator += step
    return this.normalizeIterator()
  }

  private setIterator(index: number): number {
    this.iterator = index
    return this.normalizeIterator()
  }

  private normalizeIterator(): number {
    if (typeof this.iterator === 'number' && this.iterator < 0) {
      this.iterator = this.items.length - 1
    } else if (this.iterator >= this.items.length) {
      this.iterator = 0
    }
    return this.iterator
  }

  get length(): number {
    return this.items.length
  }
}
