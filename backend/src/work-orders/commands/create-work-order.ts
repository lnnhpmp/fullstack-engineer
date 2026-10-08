import type { Deps } from '../../shared/boilerplate/deps'
import { NewItem, UrgencyLevel, WorkOrder, WorkOrderType } from '../domain/work-order'

export async function createWorkOrder(
  input: {
    deviceId: string
    type: WorkOrderType
    urgencyLevel: UrgencyLevel
    title?: string
    description: string
    isChargeable: boolean
    items: NewItem[]
  },
  deps: Pick<Deps, 'workOrders'>,
): Promise<WorkOrder> {
  const { items, ...props } = input
  const workOrderNumber = await deps.workOrders.nextNumber()
  const workOrder = WorkOrder.create({ ...props, workOrderNumber, createdAt: new Date() }, items)
  return deps.workOrders.save(workOrder)
}
