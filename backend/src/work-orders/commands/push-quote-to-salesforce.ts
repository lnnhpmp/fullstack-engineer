import { In } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'
import { QuoteStatus } from '../../quotes/domain/quote'
import { QuoteStatusesSF, QuoteStatusesSFtoDomain } from '../../quotes/infrastructure/salesforce/quote-status'
import { WorkOrder } from '../domain/work-order'

export async function pushQuoteToSalesforce(
  input: { workOrderIds: string[]; sfQuoteId?: string },
  deps: Pick<Deps, 'workOrders' | 'parts' | 'salesforce'>,
): Promise<WorkOrder[]> {
  const toAttach = await Promise.all(input.workOrderIds.map((id) => deps.workOrders.load(id)))
  const alreadyOnQuote = input.sfQuoteId ? await deps.workOrders.find({ sfQuoteIds: [input.sfQuoteId] }) : []
  alreadyOnQuote.forEach((workOrder) => workOrder.assertQuoteIsDraft())
  const workOrders = [...alreadyOnQuote.filter((wo) => !input.workOrderIds.includes(wo.id)), ...toAttach]
  workOrders.forEach((workOrder) => workOrder.assertExternalPartsIdentified())

  const partIds = workOrders.flatMap((wo) => wo.items.flatMap((item) => ('partId' in item && item.partId ? [item.partId] : [])))
  const parts = await deps.parts.findBy({ id: In(partIds) })

  const quote = await deps.salesforce.sendQuote({
    ...(input.sfQuoteId && { quoteId: input.sfQuoteId }),
    deviceIds: workOrders.map((wo) => wo.deviceId),
    rrIds: workOrders.map((wo) => wo.id),
    products: WorkOrder.toSalesforceProducts(workOrders, new Map(parts.map((p) => [p.id, p.sku]))),
    quoteDescription: workOrders[0].description,
  })

  const status = QuoteStatusesSFtoDomain[quote.quoteStatus as QuoteStatusesSF] ?? QuoteStatus.DRAFT
  toAttach.forEach((workOrder) => workOrder.attachQuote(quote.quoteId, status))
  return Promise.all(toAttach.map((workOrder) => deps.workOrders.save(workOrder)))
}
