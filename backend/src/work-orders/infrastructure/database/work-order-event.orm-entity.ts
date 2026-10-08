import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity({ schema: 'workorders', name: 'work_order_event' })
@Unique('Stream', ['workOrderId', 'version'])
export class WorkOrderEventOrmEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column('uuid') workOrderId: string
  @Column('int') version: number
  @Column() type: string
  @Column('jsonb') data: object
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date
}
