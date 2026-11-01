import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import type { PriceListPattern } from '../../domain/price-list'

@Entity({ schema: 'price_lists', name: 'price_list' })
export class PriceListOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('varchar') name: string
  @Column('varchar', { length: 2 }) country: string
  @Column('varchar', { length: 3 }) currency: string
  @Column('varchar', { length: 1 }) pattern: PriceListPattern
  @Column('varchar') confidenceTier: string
  @Column('date', { nullable: true }) validFrom: string | null
  @Column('date', { nullable: true }) validTo: string | null
  @Column('varchar') source: string
  @Column('int') version: number
  @OneToMany('PriceListLineOrmEntity', 'priceList') lines: import('./price-list-line.orm-entity').PriceListLineOrmEntity[]
}
