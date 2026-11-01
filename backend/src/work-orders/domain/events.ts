import { QuoteStatus } from '../../quotes/domain/quote'
import type { ItemProps, WorkOrderProps } from './work-order'

type Stamped<T> = T & { readonly workOrderId: string; readonly version: number; readonly date: Date }

export type WorkOrderEvent = Stamped<
  | { readonly type: 'WorkOrderCreatedEvent'; readonly workOrder: Omit<WorkOrderProps, 'items' | 'version'> }
  | { readonly type: 'ItemRequestedEvent'; readonly item: ItemProps }
  | { readonly type: 'ItemRemovedEvent'; readonly itemId: string }
  | { readonly type: 'ItemQuantityChangedEvent'; readonly itemId: string; readonly quantity: number }
  | { readonly type: 'ItemPricedEvent'; readonly itemId: string; readonly price: number }
  | {
      readonly type: 'ItemSellPriceSetEvent'
      readonly itemId: string
      readonly sellPrice: number
      readonly priceListLineId?: string
      readonly timeBandId?: string
      readonly source?: string
    }
  | { readonly type: 'CataloguePartAssignedEvent'; readonly itemId: string; readonly partId: string }
  | {
      readonly type: 'WorkOrderQuoteChangedEvent'
      readonly sfQuoteId: string
      readonly quoteNumber?: string
      readonly status: QuoteStatus
    }
  | { readonly type: 'WorkOrderCancelledEvent' }
  | { readonly type: 'WorkOrderCompletedEvent' }
>

type Unstamped<T> = T extends unknown ? Omit<T, 'workOrderId' | 'version' | 'date'> : never
export type WorkOrderEventPayload = Unstamped<WorkOrderEvent>
