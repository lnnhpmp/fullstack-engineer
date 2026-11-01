import { DataSource, In } from 'typeorm'
import { WorkOrderNotFoundError } from '../../domain/errors'
import { WorkOrder } from '../../domain/work-order'
import { WorkOrderEventOrmEntity } from './work-order-event.orm-entity'
import { WorkOrderItemOrmEntity } from './work-order-item.orm-entity'
import { WorkOrderOrmEntity } from './work-order.orm-entity'

export class WorkOrderRepository {
  constructor(private readonly db: DataSource) {}

  async load(id: string): Promise<WorkOrder> {
    const [workOrder] = await this.find({ ids: [id] })
    if (!workOrder) throw new WorkOrderNotFoundError(`Cannot find work order ${id}`)
    return workOrder
  }

  async find(where: { ids?: string[]; sfQuoteIds?: string[] }): Promise<WorkOrder[]> {
    const rows = await this.db.getRepository(WorkOrderOrmEntity).findBy({
      ...(where.ids && { id: In(where.ids) }),
      ...(where.sfQuoteIds && { sfQuoteId: In(where.sfQuoteIds) }),
    })
    return rows.map(toDomain)
  }

  async nextNumber(): Promise<string> {
    const count = await this.db.getRepository(WorkOrderOrmEntity).count()
    return `R${String(new Date().getFullYear()).slice(2)}-${String(count + 1).padStart(5, '0')}`
  }

  async save(workOrder: WorkOrder): Promise<WorkOrder> {
    const events = workOrder.uncommittedEvents
    await this.db.transaction(async (em) => {
      await em.insert(
        WorkOrderEventOrmEntity,
        events.map(({ workOrderId, version, date, type, ...data }) => ({ workOrderId, version, type, data, createdAt: date })),
      )
      await em.save(WorkOrderOrmEntity, toRow(workOrder))
    })
    workOrder.uncommittedEvents = []
    return workOrder
  }
}

function toDomain(row: WorkOrderOrmEntity): WorkOrder {
  return new WorkOrder({
    id: row.id,
    workOrderNumber: row.workOrderNumber,
    deviceId: row.deviceId,
    type: row.workOrderType,
    urgencyLevel: row.urgencyLevel,
    title: row.title ?? undefined,
    description: row.description,
    isChargeable: row.chargeable,
    items: [...row.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        id: item.id,
        type: item.type,
        partId: item.partId ?? undefined,
        quantity: item.quantity ?? undefined,
        description: item.description ?? undefined,
        comment: item.comment ?? undefined,
        price: item.price ?? undefined,
        sellPrice: item.sellPrice ?? undefined,
        priceListLineId: item.priceListLineId ?? undefined,
        timeBandId: item.timeBandId ?? undefined,
        source: item.source ?? undefined,
      })),
    sfQuoteId: row.sfQuoteId ?? undefined,
    quoteNumber: row.quoteNumber ?? undefined,
    quoteStatus: row.quoteStatus ?? undefined,
    closedAs: row.closedAs ?? undefined,
    createdAt: row.createdAt,
    version: row.version,
  })
}

function toRow(workOrder: WorkOrder): WorkOrderOrmEntity {
  const props = workOrder.toProps()
  return Object.assign(new WorkOrderOrmEntity(), {
    ...props,
    workOrderType: props.type,
    chargeable: props.isChargeable,
    title: props.title ?? null,
    sfQuoteId: props.sfQuoteId ?? null,
    quoteNumber: props.quoteNumber ?? null,
    quoteStatus: props.quoteStatus ?? null,
    closedAs: props.closedAs ?? null,
    state: workOrder.state(),
    items: props.items.map((item, position) =>
      Object.assign(new WorkOrderItemOrmEntity(), {
        ...item,
        workOrderId: workOrder.id,
        position,
        partId: item.partId ?? null,
        quantity: item.quantity ?? null,
        description: item.description ?? null,
        comment: item.comment ?? null,
        price: item.price ?? null,
        sellPrice: item.sellPrice ?? null,
        priceListLineId: item.priceListLineId ?? null,
        timeBandId: item.timeBandId ?? null,
        source: item.source ?? null,
      }),
    ),
  })
}
