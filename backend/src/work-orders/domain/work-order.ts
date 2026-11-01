import { randomUUID } from 'node:crypto';
import { EventSourced } from '../../shared/event-sourced';
import { QuoteStatus } from '../../quotes/domain/quote';
import { QuoteProduct } from '../../shared/salesforce';
import {
  ExternalPartNotIdentifiedError,
  ItemNotFoundError,
  NotAnExternalPartError,
  OneInstallationPerWorkOrderError,
  QuoteNotInDraftError,
} from './errors';
import { WorkOrderEvent, WorkOrderEventPayload } from './events';
import { ExternalPartItem, ItemProps, WorkOrderItem, WorkOrderItemType } from './work-order-item';

export enum WorkOrderType {
  CALLOUT = 'CALLOUT',
  REPAIR = 'REPAIR',
  SHUTDOWN = 'SHUTDOWN',
}

export enum UrgencyLevel {
  URGENT = 'URGENT',
  IN_THE_WEEK = 'IN_THE_WEEK',
  FOR_THE_NEXT_VISIT = 'FOR_THE_NEXT_VISIT',
}

export enum WorkOrderState {
  PART_TO_ESTIMATE = 'PART_TO_ESTIMATE',
  QUOTE_TO_SEND = 'QUOTE_TO_SEND',
  QUOTE_TO_SIGN_BY_CUSTOMER = 'QUOTE_TO_SIGN_BY_CUSTOMER',
  QUOTE_TO_VERIFY_PO = 'QUOTE_TO_VERIFY_PO',
  WORK_TO_DO = 'WORK_TO_DO',
  DONE = 'DONE',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED',
}

export type { ItemProps }

export interface WorkOrderProps {
  id: string
  workOrderNumber: string
  deviceId: string
  type: WorkOrderType
  urgencyLevel: UrgencyLevel
  title?: string
  description: string
  isChargeable: boolean
  items: ItemProps[]
  sfQuoteId?: string
  quoteNumber?: string
  quoteStatus?: QuoteStatus
  closedAs?: 'DONE' | 'CANCELLED'
  createdAt: Date
  version: number
}

export type NewItem = Omit<ItemProps, 'id'>

export class WorkOrder extends EventSourced<WorkOrderEvent> {
  readonly id: string
  workOrderNumber: string
  deviceId: string
  type: WorkOrderType
  urgencyLevel: UrgencyLevel
  title?: string
  description: string
  isChargeable: boolean
  items: WorkOrderItem[] = []
  sfQuoteId?: string
  quoteNumber?: string
  quoteStatus?: QuoteStatus
  closedAs?: 'DONE' | 'CANCELLED'
  createdAt: Date
  version: number

  constructor(props: WorkOrderProps) {
    super()
    Object.assign(this, props, { items: props.items.map(WorkOrderItem.fromProps) })
  }

  static create(props: Omit<WorkOrderProps, 'id' | 'items' | 'version'>, items: NewItem[] = [], id: string = randomUUID()): WorkOrder {
    if (!props.description) throw new Error('description is mandatory')
    const workOrder = new WorkOrder({ ...props, id, items: [], version: -1 })
    workOrder.raise({ type: 'WorkOrderCreatedEvent', workOrder: { ...props, id: workOrder.id } })
    for (const item of items) workOrder.addItem(item)
    return workOrder
  }

  static rehydrate(events: WorkOrderEvent[]): WorkOrder {
    const workOrder = Object.create(WorkOrder.prototype) as WorkOrder
    workOrder.items = []
    workOrder.uncommittedEvents = []
    for (const event of events) workOrder.apply(event)
    return workOrder
  }

  addItem(item: NewItem, id: string = randomUUID()): WorkOrderItem {
    if (item.type === WorkOrderItemType.INSTALLATION && this.items.some((i) => i.type === item.type)) {
      throw new OneInstallationPerWorkOrderError(`Work order ${this.workOrderNumber} already has an installation`)
    }
    this.raise({ type: 'ItemRequestedEvent', item: { ...item, id } })
    return this.item(id)
  }

  updateItem(itemId: string, changes: { quantity?: number; price?: number; sellPrice?: number }): WorkOrderItem {
    this.item(itemId)
    if (changes.quantity !== undefined) this.raise({ type: 'ItemQuantityChangedEvent', itemId, quantity: changes.quantity })
    if (changes.price !== undefined) this.raise({ type: 'ItemPricedEvent', itemId, price: changes.price })
    if (changes.sellPrice !== undefined) this.raise({ type: 'ItemSellPriceSetEvent', itemId, sellPrice: changes.sellPrice })
    return this.item(itemId)
  }

  pickPriceListLine(itemId: string, pick: { priceListLineId: string; timeBandId?: string; sellPrice: number }): WorkOrderItem {
    this.item(itemId)
    this.raise({
      type: 'ItemSellPriceSetEvent',
      itemId,
      sellPrice: pick.sellPrice,
      priceListLineId: pick.priceListLineId,
      timeBandId: pick.timeBandId,
      source: 'list',
    })
    return this.item(itemId)
  }

  assignCataloguePart(itemId: string, partId: string): WorkOrderItem {    if (!(this.item(itemId) instanceof ExternalPartItem)) {
      throw new NotAnExternalPartError(`Item ${itemId} on work order ${this.workOrderNumber} is not an external part`)
    }
    this.raise({ type: 'CataloguePartAssignedEvent', itemId, partId })
    return this.item(itemId)
  }

  removeItem(itemId: string): void {
    this.item(itemId)
    this.raise({ type: 'ItemRemovedEvent', itemId })
  }

  assertQuoteIsDraft(): void {
    if (this.quoteStatus && this.quoteStatus !== QuoteStatus.DRAFT) {
      throw new QuoteNotInDraftError(`Quote ${this.sfQuoteId} is ${this.quoteStatus}, work orders cannot be attached`)
    }
  }

  // An external part goes on a quote only once the supply team has assigned it a catalogue part.
  assertExternalPartsIdentified(): void {
    const pending = this.items.filter((item): item is ExternalPartItem => item instanceof ExternalPartItem && !item.partId)
    if (pending.length) {
      throw new ExternalPartNotIdentifiedError(
        `Work order ${this.workOrderNumber} has external parts with no catalogue part yet (${pending.map((item) => `"${item.description}"`).join(', ')}): the supply team must assign one before the quote can be sent to Salesforce`,
      )
    }
  }

  attachQuote(sfQuoteId: string, status: QuoteStatus, quoteNumber?: string): void {
    this.raise({ type: 'WorkOrderQuoteChangedEvent', sfQuoteId, status, quoteNumber })
  }

  cancel(): void {
    this.raise({ type: 'WorkOrderCancelledEvent' })
  }

  complete(): void {
    this.raise({ type: 'WorkOrderCompletedEvent' })
  }

  state(): WorkOrderState {
    if (this.closedAs) return WorkOrderState[this.closedAs]

    // In reality our state machine is way more complex than this
    // Mapping events from other places than just the quote.
    switch (this.quoteStatus) {
      case QuoteStatus.DRAFT:
        return WorkOrderState.QUOTE_TO_SEND
      case QuoteStatus.TO_SIGN:
        return WorkOrderState.QUOTE_TO_SIGN_BY_CUSTOMER
      case QuoteStatus.VALIDATION:
        return WorkOrderState.QUOTE_TO_VERIFY_PO
      case QuoteStatus.REFUSED:
        return WorkOrderState.DENIED
      case QuoteStatus.SIGNED:
      case QuoteStatus.WORKS_IN_PROGRESS:
        return WorkOrderState.WORK_TO_DO
      case QuoteStatus.TO_BE_BILLED:
      case QuoteStatus.BILLED:
        return WorkOrderState.DONE
    }
  
    if (!this.isChargeable) return WorkOrderState.WORK_TO_DO
    const toCost = this.items.filter((item) => item.type !== WorkOrderItemType.TECH_SUPPORT)
    return toCost.some((item) => item.price === undefined) ? WorkOrderState.PART_TO_ESTIMATE : WorkOrderState.QUOTE_TO_SEND
  }

  static toSalesforceProducts(workOrders: WorkOrder[], skus: Map<string, string>): QuoteProduct[] {
    const productMap = new Map<string, QuoteProduct>()

    for (const workOrder of workOrders) {
      for (const partRequested of workOrder.items || []) {
        const product = partRequested.toSalesforceProduct(skus)

        if (product) {
          const existing = productMap.get(product.sku)
          if (existing) {
            existing.quantity += product.quantity
            if (product.price !== undefined) {
              existing.price = Math.max(existing.price ?? 0, product.price)
            }
            if (product.cost !== undefined && product.cost !== null) {
              existing.cost = Math.max(existing.cost ?? 0, product.cost)
            }
          } else {
            productMap.set(product.sku, { ...product })
          }
        }
      }
    }

    return Array.from(productMap.values())
  }

  toProps(): WorkOrderProps {
    const { uncommittedEvents, items, ...props } = this
    return { ...props, items: items.map((item) => item.toProps()) }
  }

  apply(event: WorkOrderEvent): void {
    switch (event.type) {
      case 'WorkOrderCreatedEvent':
        Object.assign(this, event.workOrder)
        break
      case 'ItemRequestedEvent':
        this.items.push(WorkOrderItem.fromProps(event.item))
        break
      case 'ItemRemovedEvent':
        this.items = this.items.filter((item) => item.id !== event.itemId)
        break
      case 'ItemQuantityChangedEvent':
        this.item(event.itemId).changeQuantity(event.quantity)
        break
      case 'ItemPricedEvent':
        this.item(event.itemId).price = event.price
        break
      case 'ItemSellPriceSetEvent': {
        const item = this.item(event.itemId)
        item.sellPrice = event.sellPrice
        item.priceListLineId = event.priceListLineId
        item.timeBandId = event.timeBandId
        item.source = event.source
        break
      }
      case 'CataloguePartAssignedEvent':
        Object.assign(this.item(event.itemId), { partId: event.partId })
        break
      case 'WorkOrderQuoteChangedEvent':
        this.sfQuoteId = event.sfQuoteId
        this.quoteStatus = event.status
        this.quoteNumber = event.quoteNumber ?? this.quoteNumber
        break
      case 'WorkOrderCancelledEvent':
        this.closedAs = 'CANCELLED'
        break
      case 'WorkOrderCompletedEvent':
        this.closedAs = 'DONE'
        break
    }
    this.version = event.version
  }

  private raise(payload: WorkOrderEventPayload): void {
    this.record({ ...payload, workOrderId: this.id, version: this.version + 1, date: new Date() } as WorkOrderEvent)
  }

  private item(itemId: string): WorkOrderItem {
    const item = this.items.find((i) => i.id === itemId)
    if (!item) throw new ItemNotFoundError(`No item ${itemId} on work order ${this.workOrderNumber}`)
    return item
  }
}
