import type { Deps } from '../../shared/boilerplate/deps'
import { ErpItem, Part } from '../domain/part'

export async function syncPart(item: ErpItem, deps: Pick<Deps, 'parts'>): Promise<Part> {
  const existing = await deps.parts.findOneBy({ erpId: item.internalId })
  const part = Part.fromErp(item, existing?.id)
  await deps.parts.save(part)
  return part
}
