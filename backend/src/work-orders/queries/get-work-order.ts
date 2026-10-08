import { In, Not } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'
import { findContractsForDevice } from '../../contracts/queries/find-contracts-for-device'
import { WorkOrderOrmEntity } from '../infrastructure/database/work-order.orm-entity'
import { toWorkOrderView } from './work-order-view'

export async function getWorkOrder(input: { id: string }, deps: Pick<Deps, 'db' | 'parts' | 'quotes'>) {
  const workOrders = deps.db.getRepository(WorkOrderOrmEntity)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.id)
  const row = await workOrders.findOneBy(isUuid ? { id: input.id } : { workOrderNumber: input.id })
  if (!row) return null

  const partIds = row.items.flatMap((item) => (item.partId ? [item.partId] : []))
  const [parts, quotes, bundled, device] = await Promise.all([
    deps.parts.findBy({ id: In(partIds) }),
    deps.quotes.findLive(row.sfQuoteId ? [row.sfQuoteId] : []),
    row.sfQuoteId ? workOrders.findBy({ sfQuoteId: row.sfQuoteId, id: Not(row.id) }) : [],
    findContractsForDevice({ deviceId: row.deviceId }, deps),
  ])

  return {
    ...toWorkOrderView(row, parts),
    quote: quotes[0] ?? null,
    bundledWorkOrders: bundled.map((other) => toWorkOrderView(other)),
    device,
  }
}
