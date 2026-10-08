import { QuoteProduct } from '../../shared/salesforce'
import { ItemHasNoQuantityError } from './errors'

export enum WorkOrderItemType {
  PART = 'PART',
  MAN_HOUR = 'MAN_HOUR',
  EXTERNAL_PART = 'EXTERNAL_PART',
  TECH_SUPPORT = 'TECH_SUPPORT',
  INSTALLATION = 'INSTALLATION',
}

export interface ItemProps {
  id: string
  type: WorkOrderItemType
  partId?: string
  quantity?: number
  description?: string
  comment?: string
  price?: number
  sellPrice?: number
}

export abstract class WorkOrderItem {
  abstract readonly type: WorkOrderItemType
  readonly id: string
  price?: number
  /**
   * The sell price for this item (separate from cost which is stored in `price`).
   * This is used to track margin/revenue for items that need separate cost and sell price tracking.
   * Currently utilized by Installation items and available for future use by other item types.
   */
  sellPrice?: number

  constructor(props: ItemProps) {
    this.id = props.id
    this.price = props.price
    this.sellPrice = props.sellPrice
  }

  static fromProps(props: ItemProps): WorkOrderItem {
    switch (props.type) {
      case WorkOrderItemType.PART:
        return new PartItem(props)
      case WorkOrderItemType.EXTERNAL_PART:
        return new ExternalPartItem(props)
      case WorkOrderItemType.MAN_HOUR:
        return new ManHourItem(props)
      case WorkOrderItemType.INSTALLATION:
        return new InstallationItem(props)
      case WorkOrderItemType.TECH_SUPPORT:
        return new TechSupportItem(props)
    }
  }

  changeQuantity(_quantity: number): void {
    throw new ItemHasNoQuantityError(`${this.type} items have no quantity`)
  }

  abstract toSalesforceProduct(skus: Map<string, string>): QuoteProduct | null

  toProps(): ItemProps {
    return { id: this.id, type: this.type, price: this.price, sellPrice: this.sellPrice }
  }
}

export class PartItem extends WorkOrderItem {
  readonly type: WorkOrderItemType = WorkOrderItemType.PART
  partId?: string
  quantity: number

  constructor(props: ItemProps) {
    super(props)
    this.partId = props.partId
    this.quantity = props.quantity ?? 1
  }

  changeQuantity(quantity: number): void {
    this.quantity = quantity
  }

  toSalesforceProduct(skus: Map<string, string>): QuoteProduct | null {
    if (!this.partId) return null
    const sku = skus.get(this.partId)
    if (!sku) return null

    const cost = this.price
    const sellPrice = this.sellPrice

    if (cost !== undefined || sellPrice !== undefined) {
      return {
        sku,
        quantity: this.quantity,
        ...(cost !== undefined && { cost }),
        ...(sellPrice !== undefined && { price: sellPrice }),
      }
    }

    return null
  }

  toProps(): ItemProps {
    return { ...super.toProps(), partId: this.partId, quantity: this.quantity }
  }
}

export class ExternalPartItem extends PartItem {
  readonly type = WorkOrderItemType.EXTERNAL_PART
  readonly description: string

  constructor(props: ItemProps) {
    super(props)
    this.description = props.description ?? ''
  }

  toProps(): ItemProps {
    return { ...super.toProps(), description: this.description }
  }
}

export class ManHourItem extends WorkOrderItem {
  readonly type = WorkOrderItemType.MAN_HOUR
  noOfHours: number

  constructor(props: ItemProps) {
    super(props)
    this.noOfHours = props.quantity ?? 0
  }

  changeQuantity(hours: number): void {
    this.noOfHours = hours
  }

  toSalesforceProduct(): QuoteProduct {
    const cost = this.price
    const sellPrice = this.sellPrice

    return {
      sku: 'LABOUR',
      quantity: this.noOfHours,
      ...(cost !== undefined && { cost }),
      ...(sellPrice !== undefined && { price: sellPrice }),
    }
  }

  toProps(): ItemProps {
    return { ...super.toProps(), quantity: this.noOfHours }
  }
}

export class InstallationItem extends WorkOrderItem {
  readonly type = WorkOrderItemType.INSTALLATION

  toSalesforceProduct(): QuoteProduct {
    const cost = this.price
    const sellPrice = this.sellPrice

    return {
      sku: 'INSTALLATION',
      quantity: 1,
      ...(cost !== undefined && { cost }),
      ...(sellPrice !== undefined && { price: sellPrice }),
    }
  }
}

export class TechSupportItem extends WorkOrderItem {
  readonly type = WorkOrderItemType.TECH_SUPPORT
  readonly comment: string

  constructor(props: ItemProps) {
    super(props)
    this.comment = props.comment ?? ''
  }

  toSalesforceProduct(): null {
    return null
  }

  toProps(): ItemProps {
    return { ...super.toProps(), comment: this.comment }
  }
}
