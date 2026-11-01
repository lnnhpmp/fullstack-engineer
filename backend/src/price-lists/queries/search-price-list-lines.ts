import { ILike } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'
import type { PriceListLineKind } from '../domain/price-list'
import { PriceListLineOrmEntity } from '../infrastructure/database/price-list-line.orm-entity'

export async function searchPriceListLines(
  input: { priceListId: string; query: string; kind?: PriceListLineKind; limit?: number },
  deps: Pick<Deps, 'db'>,
) {
  const term = input.query.trim()
  const base = { priceListId: input.priceListId, ...(input.kind ? { kind: input.kind } : {}) }
  const where = term
    ? [
        { ...base, code: ILike(`%${term}%`) },
        { ...base, designation: ILike(`%${term}%`) },
      ]
    : base

  const lines = await deps.db.getRepository(PriceListLineOrmEntity).find({
    where,
    relations: { prices: { timeBand: true } },
    order: { code: 'ASC' },
    take: input.limit ?? 20,
  })
  return lines.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? '', undefined, { numeric: true }))
}
