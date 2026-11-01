import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { PriceListLineOrmEntity } from './price-list-line.orm-entity'
import type { TimeBandOrmEntity } from './time-band.orm-entity'

const decimal = { to: (value: number) => value, from: (value: string) => Number(value) }

@Entity({ schema: 'price_lists', name: 'price_list_line_price' })
export class PriceListLinePriceOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('uuid') @Index() lineId: string
  @Column('uuid', { nullable: true }) timeBandId: string | null
  @Column('decimal', { precision: 12, scale: 2, transformer: decimal }) unitPrice: number
  @ManyToOne('PriceListLineOrmEntity', 'prices', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lineId' })
  line?: PriceListLineOrmEntity
  @ManyToOne('TimeBandOrmEntity', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'timeBandId' })
  timeBand?: TimeBandOrmEntity
}
