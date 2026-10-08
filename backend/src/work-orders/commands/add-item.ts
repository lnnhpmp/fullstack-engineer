import type { Deps } from '../../shared/boilerplate/deps'
import { NewItem, WorkOrder } from '../domain/work-order'

export async function addItem(input: { workOrderId: string; item: NewItem }, deps: Pick<Deps, 'workOrders'>): Promise<WorkOrder> {
  const workOrder = await deps.workOrders.load(input.workOrderId)
  workOrder.addItem(input.item)
  return deps.workOrders.save(workOrder)
}
