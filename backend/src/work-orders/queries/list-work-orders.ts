import { ILike, In } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'
import { DeviceOrmEntity } from '../../contracts/infrastructure/database/device.orm-entity'
import { WorkOrderState } from '../domain/work-order'
import { WorkOrderOrmEntity } from '../infrastructure/database/work-order.orm-entity'
import { toWorkOrderView, WorkOrderView } from './work-order-view'

export async function listWorkOrders(
  input: { limit?: number; offset?: number; states?: WorkOrderState[]; sfQuoteId?: string; buildingId?: string; search?: string },
  deps: Pick<Deps, 'db'>,
): Promise<{ items: WorkOrderView[]; totalCount: number }> {
  const devices = input.buildingId ? await deps.db.getRepository(DeviceOrmEntity).findBy({ buildingId: input.buildingId }) : undefined
  const filters = {
    ...(input.states?.length && { state: In(input.states) }),
    ...(input.sfQuoteId && { sfQuoteId: input.sfQuoteId }),
    ...(devices && { deviceId: In(devices.map((device) => device.id)) }),
  }
  const search = input.search && `%${input.search}%`
  const [rows, totalCount] = await deps.db.getRepository(WorkOrderOrmEntity).findAndCount({
    where: search ? [{ ...filters, workOrderNumber: ILike(search) }, { ...filters, title: ILike(search) }] : filters,
    order: { createdAt: 'DESC' },
    take: input.limit ?? 50,
    skip: input.offset ?? 0,
  })
  return { items: rows.map((row) => toWorkOrderView(row)), totalCount }
}
