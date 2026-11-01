import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import type { CustomerOrmEntity } from '../../../contracts/infrastructure/database/customer.orm-entity'
import type { PriceListOrmEntity } from './price-list.orm-entity'

@Entity({ schema: 'price_lists', name: 'account_price_list' })
export class AccountPriceListOrmEntity {
  @PrimaryColumn('uuid') priceListId: string
  @PrimaryColumn('int') customerId: number
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date
  @ManyToOne('PriceListOrmEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'priceListId' })
  priceList?: PriceListOrmEntity
  @ManyToOne('CustomerOrmEntity', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer?: CustomerOrmEntity
}
