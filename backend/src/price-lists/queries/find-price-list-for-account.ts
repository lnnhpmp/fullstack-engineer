import type { Deps } from '../../shared/boilerplate/deps'
import { AccountPriceListOrmEntity } from '../infrastructure/database/account-price-list.orm-entity'
import { PriceListOrmEntity } from '../infrastructure/database/price-list.orm-entity'

export async function findPriceListForAccount(customerId: number, deps: Pick<Deps, 'db'>) {
  const link = await deps.db.getRepository(AccountPriceListOrmEntity).findOne({
    where: { customerId },
    order: { createdAt: 'ASC' },
  })
  if (!link) return null

  const list = await deps.db.getRepository(PriceListOrmEntity).findOne({
    where: { id: link.priceListId },
    relations: { lines: { prices: { timeBand: true } } },
  })
  if (!list) return null

  list.lines.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '', undefined, { numeric: true }))
  return list
}
