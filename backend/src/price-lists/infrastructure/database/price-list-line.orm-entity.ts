import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm'
import type { PriceListLineKind } from '../../domain/price-list'
import type { AnchorCatalogItemOrmEntity } from './anchor-catalog-item.orm-entity'
import type { PriceListLinePriceOrmEntity } from './price-list-line-price.orm-entity'
import type { PriceListOrmEntity } from './price-list.orm-entity'

const decimal = { to: (value: number | null) => value, from: (value: string | null) => (value === null ? null : Number(value)) }

@Entity({ schema: 'price_lists', name: 'price_list_line' })
export class PriceListLineOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('uuid') @Index() priceListId: string
  @Column('varchar', { nullable: true }) code: string | null
  @Column('text', { nullable: true }) designation: string | null
  @Column('varchar', { nullable: true }) section: string | null
  @Column('varchar') kind: PriceListLineKind
  @Column('varchar', { nullable: true }) unitOfMeasure: string | null
  @Column('uuid', { nullable: true }) anchorCatalogItemId: string | null
  @Column('varchar', { nullable: true }) coefficientTarget: string | null
  @Column('decimal', { precision: 6, scale: 4, nullable: true, transformer: decimal }) coefficient: number | null
  @Column('decimal', { precision: 5, scale: 2, nullable: true, transformer: decimal }) discountPct: number | null
  @Column('int', { nullable: true }) minQuantity: number | null
  @Column('int', { nullable: true }) maxQuantity: number | null
  @Column('date', { nullable: true }) validFrom: string | null
  @Column('date', { nullable: true }) validTo: string | null
  @ManyToOne('PriceListOrmEntity', 'lines', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'priceListId' })
  priceList?: PriceListOrmEntity
  @ManyToOne('AnchorCatalogItemOrmEntity', { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'anchorCatalogItemId' })
  anchorCatalogItem?: AnchorCatalogItemOrmEntity
  @OneToMany('PriceListLinePriceOrmEntity', 'line')
  prices: PriceListLinePriceOrmEntity[]
}
