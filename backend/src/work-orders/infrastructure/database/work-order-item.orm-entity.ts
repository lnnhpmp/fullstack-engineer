import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { WorkOrderItemType } from '../../domain/work-order-item'
import type { WorkOrderOrmEntity } from './work-order.orm-entity'

const decimal = { to: (v: number | null) => v, from: (v: string | null) => (v === null ? null : Number(v)) }

@Entity({ schema: 'workorders', name: 'work_order_item' })
export class WorkOrderItemOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('uuid') workOrderId: string
  @Column() position: number
  @Column('enum', { enum: WorkOrderItemType }) type: WorkOrderItemType
  @Column('uuid', { nullable: true }) partId: string | null
  @Column('float', { nullable: true }) quantity: number | null
  @Column('varchar', { nullable: true }) description: string | null
  @Column('varchar', { nullable: true }) comment: string | null
  @Column('decimal', { precision: 12, scale: 2, nullable: true, transformer: decimal }) price: number | null
  @Column('decimal', { precision: 12, scale: 2, nullable: true, transformer: decimal }) sellPrice: number | null
  @Column('uuid', { nullable: true }) priceListLineId: string | null
  @Column('uuid', { nullable: true }) timeBandId: string | null
  @Column('varchar', { nullable: true }) source: string | null
  @ManyToOne('WorkOrderOrmEntity', 'items', { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'workOrderId' })
  workOrder?: WorkOrderOrmEntity
}
