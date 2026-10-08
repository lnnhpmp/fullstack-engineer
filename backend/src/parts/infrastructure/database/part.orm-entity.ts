import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity({ schema: 'workorders', name: 'part' })
export class PartOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column() @Index() erpId: string
  @Column() @Index() sku: string
  @Column() name: string
  @Column('varchar', { nullable: true }) brand?: string
  @Column('float', { nullable: true }) averageCost?: number
  @Column({ default: false }) isInactive: boolean
}
