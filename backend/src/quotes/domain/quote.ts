import { EventSourced } from '../../shared/event-sourced'
import { QuoteEvent } from './events'

export enum QuoteStatus {
  DRAFT = 'draft',
  TO_SIGN = 'to-sign',
  VALIDATION = 'validation',
  SIGNED = 'signed',
  WORKS_IN_PROGRESS = 'works-in-progress',
  TO_BE_BILLED = 'to-be-billed',
  BILLED = 'billed',
  REFUSED = 'refused',
}

export interface SalesforceQuote {
  id: string
  reference: string
  number: string
  status: QuoteStatus
  grandTotal: number
  currencyISOCode: string
  emittedDate: Date
  description: string
  accountName: string
  documentAvailable: boolean
  preferredRecipient?: string
  referent: { name: string; email: string }
}

export interface QuoteNotification {
  channel: 'email' | 'slack'
  message: string
}

export class Quote extends EventSourced<QuoteEvent> {
  readonly id: string
  readonly reference: string
  readonly status: QuoteStatus
  readonly preferredRecipient?: string
  readonly referent: { name: string; email: string }
  acceptanceEmailSent = false
  todoOpen = false

  constructor(salesforce: SalesforceQuote, history: QuoteEvent[]) {
    super()
    this.id = salesforce.id
    this.reference = salesforce.reference
    this.status = salesforce.status
    this.preferredRecipient = salesforce.preferredRecipient
    this.referent = salesforce.referent
    history.forEach((event) => this.apply(event))
  }

  recordStatus(status: QuoteStatus, date: Date = new Date()): QuoteNotification[] {
    const notifications: QuoteNotification[] = []
    this.record({ type: 'status-changed', quoteId: this.id, date, status })

    if (status === QuoteStatus.SIGNED && !this.acceptanceEmailSent) {
      const customerEmail = this.preferredRecipient ?? ''
      const supportEmail = this.referent.email
      this.record({ type: 'acceptance-email-sent', quoteId: this.id, date, customerEmail, supportEmail })
      notifications.push({ channel: 'email', message: `${this.reference} accepted, to ${customerEmail}, ${supportEmail}` })
    }
    if (status === QuoteStatus.VALIDATION && !this.todoOpen) {
      this.record({ type: 'todo-created', quoteId: this.id, date })
      notifications.push({ channel: 'slack', message: `:bell: signed quote ${this.reference} to process` })
    }
    if (status === QuoteStatus.SIGNED && this.todoOpen) {
      this.record({ type: 'todo-resolved', quoteId: this.id, date })
      notifications.push({ channel: 'slack', message: `:white_check_mark: signed quote ${this.reference} processed` })
    }
    return notifications
  }

  apply(event: QuoteEvent): void {
    switch (event.type) {
      case 'acceptance-email-sent':
        this.acceptanceEmailSent = true
        break
      case 'todo-created':
        this.todoOpen = true
        break
      case 'todo-resolved':
        this.todoOpen = false
        break
    }
  }
}
