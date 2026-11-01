import { ILike, In } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'
import { BuildingOrmEntity } from '../../contracts/infrastructure/database/building.orm-entity'
import { CustomerOrmEntity } from '../../contracts/infrastructure/database/customer.orm-entity'
import { DeviceOrmEntity } from '../../contracts/infrastructure/database/device.orm-entity'
import { WorkOrderState } from '../domain/work-order'
import { WorkOrderOrmEntity } from '../infrastructure/database/work-order.orm-entity'
import { toWorkOrderView, WorkOrderView } from './work-order-view'

export async function listWorkOrders(
  input: { limit?: number; offset?: number; states?: WorkOrderState[]; sfQuoteId?: string; buildingId?: string; search?: string },
  deps: Pick<Deps, 'db'>,
): Promise<{ items: WorkOrderView[]; totalCount: number }> {
  const search = input.search && `%${input.search}%`

  // Devices for the explicit building filter.
  const buildingDevices = input.buildingId ? await deps.db.getRepository(DeviceOrmEntity).findBy({ buildingId: input.buildingId }) : []

  // Devices whose client name matches the search (search by client name).
  let customerDevices: DeviceOrmEntity[] = []
  if (search) {
    const customers = await deps.db.getRepository(CustomerOrmEntity).findBy({ companyName: ILike(search) })
    if (customers.length) {
      const buildings = await deps.db.getRepository(BuildingOrmEntity).findBy({ customerId: In(customers.map((customer) => customer.id)) })
      if (buildings.length) {
        customerDevices = await deps.db.getRepository(DeviceOrmEntity).findBy({ buildingId: In(buildings.map((building) => building.id)) })
      }
    }
  }

  const filters = {
    ...(input.states?.length && { state: In(input.states) }),
    ...(input.sfQuoteId && { sfQuoteId: input.sfQuoteId }),
    ...(buildingDevices.length && { deviceId: In(buildingDevices.map((device) => device.id)) }),
  }

  const where = search
    ? [
        { ...filters, workOrderNumber: ILike(search) },
        { ...filters, title: ILike(search) },
        ...(customerDevices.length ? [{ ...filters, deviceId: In(customerDevices.map((device) => device.id)) }] : []),
      ]
    : filters

  const [rows, totalCount] = await deps.db.getRepository(WorkOrderOrmEntity).findAndCount({
    where,
    order: { createdAt: 'DESC' },
    take: input.limit ?? 50,
    skip: input.offset ?? 0,
  })
  return { items: rows.map((row) => toWorkOrderView(row)), totalCount }
}
