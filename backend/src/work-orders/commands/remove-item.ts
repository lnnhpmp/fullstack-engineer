import type { Deps } from '../../shared/boilerplate/deps'
import { WorkOrder } from '../domain/work-order'

export async function removeItem(input: { workOrderId: string; itemId: string }, deps: Pick<Deps, 'workOrders'>): Promise<WorkOrder> {
  const workOrder = await deps.workOrders.load(input.workOrderId)
  workOrder.removeItem(input.itemId)
  return deps.workOrders.save(workOrder)
}
