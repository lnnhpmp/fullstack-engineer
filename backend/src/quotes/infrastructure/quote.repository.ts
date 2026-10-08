import { SalesforceClient } from '../../shared/salesforce'
import { QuoteNotFoundError } from '../domain/errors'
import { Quote, SalesforceQuote } from '../domain/quote'
import { QuoteEventStore } from './database/quote-event.store'
import { QuoteStatusesSF, QuoteStatusesSFtoDomain } from './salesforce/quote-status'

interface SFQuote {
  Id: string
  Name: string
  QuoteNumber: string
  Description__c: string | null
  Status: QuoteStatusesSF
  GrandTotal: number
  CurrencyIsoCode: string
  SentDate__c: string | null
  CreatedDate: string
  Account: { Name: string } | null
  Email: string | null
  Opportunity: { Owner: { Name: string; Email: string } | null } | null
  ContentDocumentLinks: { records: unknown[] } | null
}

export class QuoteRepository {
  constructor(
    private readonly salesforce: SalesforceClient,
    private readonly events: QuoteEventStore,
  ) {}

  async load(id: string): Promise<Quote> {
    const [salesforceQuote] = await this.findLive([id])
    if (!salesforceQuote) throw new QuoteNotFoundError(`Quote ${id} not found in Salesforce`)
    return new Quote(salesforceQuote, await this.events.stream(id))
  }

  async save(quote: Quote): Promise<void> {
    for (const event of quote.uncommittedEvents) await this.events.append(event)
    quote.uncommittedEvents = []
  }

  async findLive(ids: string[]): Promise<SalesforceQuote[]> {
    if (!ids.length) return []
    const records = await this.salesforce.query<SFQuote>(
      'SELECT Id, Name, QuoteNumber, Description__c, Status, GrandTotal, CurrencyIsoCode, SentDate__c, CreatedDate, ' +
        'Account.Name, Email, Opportunity.Owner.Name, Opportunity.Owner.Email, ' +
        '(SELECT ContentDocumentId FROM ContentDocumentLinks ORDER BY SystemModstamp DESC) ' +
        `FROM Quote WHERE Id IN (${ids.map((id) => `'${id}'`).join(', ')})`,
    )
    return records.map(toSalesforceQuote)
  }
}

function toSalesforceQuote(record: SFQuote): SalesforceQuote {
  return {
    id: record.Id,
    reference: record.Name,
    number: record.QuoteNumber,
    status: QuoteStatusesSFtoDomain[record.Status],
    grandTotal: record.GrandTotal,
    currencyISOCode: record.CurrencyIsoCode,
    emittedDate: new Date(record.SentDate__c ?? record.CreatedDate),
    description: record.Description__c ?? '',
    accountName: record.Account?.Name ?? '',
    documentAvailable: !!record.ContentDocumentLinks?.records.length,
    preferredRecipient: record.Email ?? undefined,
    referent: { name: record.Opportunity?.Owner?.Name ?? '', email: record.Opportunity?.Owner?.Email ?? '' },
  }
}
