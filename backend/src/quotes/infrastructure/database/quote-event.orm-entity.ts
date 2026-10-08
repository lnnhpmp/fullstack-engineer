import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'

const QUOTE_EVENT_TYPES = [
  'status-changed',
  'presented-email-sent',
  'acceptance-email-sent',
  'todo-created',
  'todo-resolved',
  'work-order-created',
  'quote-refused',
]

@Entity({ schema: 'workorders', name: 'quote_events' })
export class QuoteEventOrmEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() @Index() quoteId: string
  @Column() @Index() date: Date
  @Column({ type: 'enum', enum: QUOTE_EVENT_TYPES }) type: string
  @Column('jsonb', { nullable: true }) data: object | null
}
