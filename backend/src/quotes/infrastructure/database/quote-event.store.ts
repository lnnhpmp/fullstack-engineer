import { DataSource } from 'typeorm'
import { QuoteEvent } from '../../domain/events'
import { QuoteEventOrmEntity } from './quote-event.orm-entity'

export class QuoteEventStore {
  constructor(private readonly db: DataSource) {}

  async append(event: QuoteEvent): Promise<void> {
    const { type, quoteId, date, ...data } = event
    await this.db.getRepository(QuoteEventOrmEntity).insert({ type, quoteId, date, data: Object.keys(data).length ? data : null })
  }

  async stream(quoteId: string): Promise<QuoteEvent[]> {
    const rows = await this.db.getRepository(QuoteEventOrmEntity).find({ where: { quoteId }, order: { date: 'ASC' } })
    return rows.map((row) => ({ ...row.data, type: row.type, quoteId: row.quoteId, date: row.date }) as QuoteEvent)
  }
}
