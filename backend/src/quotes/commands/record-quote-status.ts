import type { Deps } from '../../shared/boilerplate/deps'
import { QuoteStatus } from '../domain/quote'

export async function recordQuoteStatus(
  input: { quoteId: string; status: QuoteStatus; date?: Date },
  deps: Pick<Deps, 'quotes' | 'notify'>,
): Promise<void> {
  const quote = await deps.quotes.load(input.quoteId)
  const notifications = quote.recordStatus(input.status, input.date)
  await deps.quotes.save(quote)
  for (const notification of notifications) deps.notify(notification)
}
