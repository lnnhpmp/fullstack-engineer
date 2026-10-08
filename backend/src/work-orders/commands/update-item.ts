import type { Deps } from '../../shared/boilerplate/deps'
import { WorkOrder } from '../domain/work-order'

export async function updateItem(
  input: { workOrderId: string; itemId: string; quantity?: number; price?: number; sellPrice?: number },
  deps: Pick<Deps, 'workOrders'>,
): Promise<WorkOrder> {
  const workOrder = await deps.workOrders.load(input.workOrderId)
  workOrder.updateItem(input.itemId, input)
  return deps.workOrders.save(workOrder)
}
