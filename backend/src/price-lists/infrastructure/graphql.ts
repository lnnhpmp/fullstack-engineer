import type { Deps } from '../../shared/boilerplate/deps'
import { getWorkOrder } from '../../work-orders/queries/get-work-order'
import { pickPriceListLine, type PickPriceListLineInput } from '../commands/pick-price-list-line'
import type { PriceListLineKind } from '../domain/price-list'
import { findPriceListForAccount } from '../queries/find-price-list-for-account'
import { findPriceListLine } from '../queries/find-price-list-line'
import { searchPriceListLines } from '../queries/search-price-list-lines'

export function priceListResolvers(deps: Deps) {
  return {
    Query: {
      priceListForAccount: (_: unknown, args: { customerId: number }) => findPriceListForAccount(args.customerId, deps),
      searchPriceListLines: (
        _: unknown,
        args: { priceListId: string; query: string; kind?: PriceListLineKind; limit?: number },
      ) => searchPriceListLines(args, deps),
      priceListLine: (_: unknown, args: { id: string }) => findPriceListLine(args.id, deps),
    },
    Mutation: {
      pickPriceListLine: async (_: unknown, args: { input: PickPriceListLineInput }) => {
        const workOrder = await pickPriceListLine(args.input, deps)
        return getWorkOrder({ id: workOrder.id }, deps)
      },
    },
  }
}
