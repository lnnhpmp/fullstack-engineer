import type { Deps } from '../../shared/boilerplate/deps'
import { QuoteStatus } from '../../quotes/domain/quote'
import { WorkOrder } from '../domain/work-order'

export async function registerQuoteChange(
  input: { workOrderId: string; sfQuoteId: string; quoteNumber?: string; status: QuoteStatus },
  deps: Pick<Deps, 'workOrders'>,
): Promise<WorkOrder> {
  const workOrder = await deps.workOrders.load(input.workOrderId)
  workOrder.attachQuote(input.sfQuoteId, input.status, input.quoteNumber)
  return deps.workOrders.save(workOrder)
}
