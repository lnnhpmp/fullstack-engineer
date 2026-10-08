import { randomUUID } from 'node:crypto'

export interface ErpItem {
  internalId: string
  itemId: string
  displayName: string
  brand?: string
  averageCost?: number
  isInactive: boolean
}

export class Part {
  constructor(
    readonly id: string,
    readonly erpId: string,
    readonly sku: string,
    readonly name: string,
    readonly brand: string | undefined,
    readonly averageCost: number | undefined,
    readonly isInactive: boolean,
  ) {}

  static fromErp(item: ErpItem, id: string = randomUUID()): Part {
    return new Part(id, item.internalId, item.itemId, item.displayName, item.brand, item.averageCost, item.isInactive)
  }
}
