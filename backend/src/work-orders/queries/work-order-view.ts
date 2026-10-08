import { PartOrmEntity } from '../../parts/infrastructure/database/part.orm-entity'
import { WorkOrderOrmEntity } from '../infrastructure/database/work-order.orm-entity'

export function toWorkOrderView(row: WorkOrderOrmEntity, parts: PartOrmEntity[] = []) {
  return {
    ...row,
    isChargeable: row.chargeable,
    items: [...row.items]
      .sort((a, b) => a.position - b.position)
      .map((item) => ({ ...item, part: parts.find((part) => part.id === item.partId) ?? null })),
  }
}

export type WorkOrderView = ReturnType<typeof toWorkOrderView>
