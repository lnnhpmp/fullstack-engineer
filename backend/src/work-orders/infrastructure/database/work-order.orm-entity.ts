import { Column, Entity, Index, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { QuoteStatus } from '../../../quotes/domain/quote'
import { UrgencyLevel, WorkOrderState, WorkOrderType } from '../../domain/work-order'
import type { WorkOrderItemOrmEntity } from './work-order-item.orm-entity'

@Entity({ schema: 'workorders', name: 'work_order' })
export class WorkOrderOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column({ unique: true }) workOrderNumber: string
  @Column() @Index() deviceId: string
  @Column('enum', { enum: WorkOrderType, default: WorkOrderType.REPAIR }) workOrderType: WorkOrderType
  @Column('enum', { enum: UrgencyLevel }) urgencyLevel: UrgencyLevel
  @Column('varchar', { nullable: true }) title: string | null
  @Column() description: string
  @Column({ default: false }) chargeable: boolean
  @Column('enum', { enum: WorkOrderState }) state: WorkOrderState
  @Column('varchar', { nullable: true }) closedAs: 'DONE' | 'CANCELLED' | null
  @Column('varchar', { nullable: true }) sfQuoteId: string | null
  @Column('varchar', { nullable: true }) quoteNumber: string | null
  @Column('varchar', { nullable: true }) quoteStatus: QuoteStatus | null
  @OneToMany('WorkOrderItemOrmEntity', 'workOrder', { cascade: true, eager: true }) items: WorkOrderItemOrmEntity[]
  @Column('timestamptz') createdAt: Date
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt: Date
  @Column() version: number
}
