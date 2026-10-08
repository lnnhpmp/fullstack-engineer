import type { Deps } from '../../shared/boilerplate/deps'
import { PartNotFoundError } from '../domain/errors'
import { WorkOrder } from '../domain/work-order'

export async function assignCataloguePart(
  input: { workOrderId: string; itemId: string; partId: string },
  deps: Pick<Deps, 'workOrders' | 'parts'>,
): Promise<WorkOrder> {
  const part = await deps.parts.findOneBy({ id: input.partId })
  if (!part) throw new PartNotFoundError(`No part ${input.partId} in the catalogue`)
  const workOrder = await deps.workOrders.load(input.workOrderId)
  workOrder.assignCataloguePart(input.itemId, part.id)
  return deps.workOrders.save(workOrder)
}
