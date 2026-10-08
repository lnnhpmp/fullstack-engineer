import type { Deps } from '../../shared/boilerplate/deps'
import { findContractsForDevice } from '../../contracts/queries/find-contracts-for-device'
import { QuoteStatus } from '../../quotes/domain/quote'
import { addItem } from '../commands/add-item'
import { assignCataloguePart } from '../commands/assign-catalogue-part'
import { createWorkOrder } from '../commands/create-work-order'
import { pushQuoteToSalesforce } from '../commands/push-quote-to-salesforce'
import { removeItem } from '../commands/remove-item'
import { updateItem } from '../commands/update-item'
import { WorkOrder } from '../domain/work-order'
import { getWorkOrder } from '../queries/get-work-order'
import { listWorkOrders } from '../queries/list-work-orders'

type Args = Record<string, any>

export function workOrderResolvers(deps: Deps) {
  const reread = async (workOrder: WorkOrder) => (await getWorkOrder({ id: workOrder.id }, deps))!
  const sfQuoteLink = (workOrder: { sfQuoteId: string | null }) =>
    workOrder.sfQuoteId ? deps.salesforce.recordUrl('Quote', workOrder.sfQuoteId) : null
  return {
    Query: {
      workOrders: (_: unknown, args: Args) => listWorkOrders(args, deps),
      workOrder: (_: unknown, args: Args) => getWorkOrder({ id: args.id }, deps),
    },
    Mutation: {
      createWorkOrder: async (_: unknown, { input }: Args) => reread(await createWorkOrder(input, deps)),
      addItem: async (_: unknown, { input }: Args) => {
        const { workOrderId, ...item } = input
        return reread(await addItem({ workOrderId, item }, deps))
      },
      updateItem: async (_: unknown, { input }: Args) => reread(await updateItem(input, deps)),
      assignCataloguePart: async (_: unknown, args: Args) =>
        reread(await assignCataloguePart({ workOrderId: args.workOrderId, itemId: args.itemId, partId: args.partId }, deps)),
      removeItem: async (_: unknown, args: Args) => reread(await removeItem({ workOrderId: args.workOrderId, itemId: args.itemId }, deps)),
      pushQuoteToSalesforce: async (_: unknown, args: Args) =>
        Promise.all((await pushQuoteToSalesforce({ workOrderIds: args.workOrderIds, sfQuoteId: args.sfQuoteId ?? undefined }, deps)).map(reread)),
    },
    WorkOrder: {
      sfQuoteLink,
      device: (workOrder: { deviceId: string }) => findContractsForDevice({ deviceId: workOrder.deviceId }, deps),
    },
    WorkOrderDetails: { sfQuoteLink },
    QuoteStatus: {
      DRAFT: QuoteStatus.DRAFT,
      TO_SIGN: QuoteStatus.TO_SIGN,
      VALIDATION: QuoteStatus.VALIDATION,
      SIGNED: QuoteStatus.SIGNED,
      WORKS_IN_PROGRESS: QuoteStatus.WORKS_IN_PROGRESS,
      TO_BE_BILLED: QuoteStatus.TO_BE_BILLED,
      BILLED: QuoteStatus.BILLED,
      REFUSED: QuoteStatus.REFUSED,
    },
  }
}
