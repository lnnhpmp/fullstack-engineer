import type { Deps } from '../../shared/boilerplate/deps'
import { PriceListLineOrmEntity } from '../infrastructure/database/price-list-line.orm-entity'

export async function findPriceListLine(id: string, deps: Pick<Deps, 'db'>) {
  return deps.db.getRepository(PriceListLineOrmEntity).findOne({
    where: { id },
    relations: { prices: { timeBand: true } },
  })
}
