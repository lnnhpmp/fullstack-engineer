import type { QuoteStatus } from './quote'

export type QuoteEvent =
  | { readonly type: 'status-changed'; readonly quoteId: string; readonly date: Date; readonly status: QuoteStatus }
  | {
      readonly type: 'acceptance-email-sent'
      readonly quoteId: string
      readonly date: Date
      readonly customerEmail: string
      readonly supportEmail: string
    }
  | { readonly type: 'todo-created'; readonly quoteId: string; readonly date: Date }
  | { readonly type: 'todo-resolved'; readonly quoteId: string; readonly date: Date }
