import { ILike } from 'typeorm'
import type { Deps } from '../../shared/boilerplate/deps'

export async function findParts(input: { search?: string; limit?: number }, deps: Pick<Deps, 'parts'>) {
  const search = input.search ? `%${input.search}%` : undefined
  return deps.parts.find({
    where: search ? [{ sku: ILike(search) }, { name: ILike(search) }] : {},
    order: { sku: 'ASC' },
    take: input.limit ?? 50,
  })
}
