import { DeviceOrmEntity } from '../../contracts/infrastructure/database/device.orm-entity'
import type { Deps } from '../../shared/boilerplate/deps'
import { ItemNotFoundError } from '../../work-orders/domain/errors'
import { WorkOrderItemType } from '../../work-orders/domain/work-order-item'
import { PriceListLineKind } from '../domain/price-list'
import {
  PriceListLineNotFoundError,
  PriceListNotAvailableForAccountError,
  ItemTypeNotPriceableFromListError,
  TimeBandRequiredError,
} from '../domain/errors'
import { AccountPriceListOrmEntity } from '../infrastructure/database/account-price-list.orm-entity'
import { PriceListLineOrmEntity } from '../infrastructure/database/price-list-line.orm-entity'

export interface PickPriceListLineInput {
  workOrderId: string
  itemId: string
  priceListLineId: string
  timeBandId?: string
}

export async function pickPriceListLine(input: PickPriceListLineInput, deps: Pick<Deps, 'db' | 'workOrders'>) {
  const workOrder = await deps.workOrders.load(input.workOrderId)
  const item = workOrder.items.find((candidate) => candidate.id === input.itemId)
  if (!item) throw new ItemNotFoundError(`No item ${input.itemId} on work order ${workOrder.workOrderNumber}`)

  const line = await deps.db.getRepository(PriceListLineOrmEntity).findOne({
    where: { id: input.priceListLineId },
    relations: { prices: true },
  })
  if (!line) throw new PriceListLineNotFoundError(`No price-list line ${input.priceListLineId}`)

  const device = await deps.db.getRepository(DeviceOrmEntity).findOne({
    where: { id: workOrder.deviceId },
    relations: { building: true },
  })
  const customerId = device?.building?.customerId
  if (!customerId) throw new PriceListNotAvailableForAccountError(`Work order ${workOrder.workOrderNumber} has no account`)

  const link = await deps.db.getRepository(AccountPriceListOrmEntity).findOneBy({
    priceListId: line.priceListId,
    customerId,
  })
  if (!link) {
    throw new PriceListNotAvailableForAccountError(
      `Price list ${line.priceListId} is not linked to customer ${customerId}`,
    )
  }

  assertItemCanPick(item.type, line.kind)

  const price = selectPrice(line, input.timeBandId)
  workOrder.pickPriceListLine(input.itemId, {
    priceListLineId: line.id,
    timeBandId: price.timeBandId ?? undefined,
    sellPrice: price.unitPrice,
  })
  return deps.workOrders.save(workOrder)
}

function assertItemCanPick(type: WorkOrderItemType, kind: PriceListLineKind): void {
  if (type === WorkOrderItemType.MAN_HOUR) {
    if (kind !== PriceListLineKind.LABOUR_RATE) {
      throw new ItemTypeNotPriceableFromListError(`A MAN_HOUR item can only pick a LABOUR_RATE line, not ${kind}`)
    }
    return
  }
  if (type === WorkOrderItemType.PART || type === WorkOrderItemType.EXTERNAL_PART) {
    if (kind !== PriceListLineKind.LINE) {
      throw new ItemTypeNotPriceableFromListError(`A part item can only pick a LINE, not ${kind}`)
    }
    return
  }
  throw new ItemTypeNotPriceableFromListError(`${type} items cannot be priced from a price list`)
}

function selectPrice(line: PriceListLineOrmEntity, timeBandId?: string) {
  const prices = line.prices ?? []
  if (!prices.length) {
    throw new PriceListLineNotFoundError(`Price-list line ${line.id} (${line.kind}) has no price`)
  }
  if (timeBandId) {
    const price = prices.find((candidate) => candidate.timeBandId === timeBandId)
    if (!price) throw new TimeBandRequiredError(`Time band ${timeBandId} has no price on line ${line.id}`)
    return price
  }
  if (prices.length === 1) return prices[0]
  throw new TimeBandRequiredError(`Line ${line.id} is priced in ${prices.length} bands: timeBandId is required`)
}
