import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { BuildingOrmEntity } from '../../contracts/infrastructure/database/building.orm-entity'
import { ContractDeviceOrmEntity } from '../../contracts/infrastructure/database/contract-device.orm-entity'
import { ContractOrmEntity } from '../../contracts/infrastructure/database/contract.orm-entity'
import { CustomerOrmEntity } from '../../contracts/infrastructure/database/customer.orm-entity'
import { DeviceOrmEntity } from '../../contracts/infrastructure/database/device.orm-entity'
import { PartOrmEntity } from '../../parts/infrastructure/database/part.orm-entity'
import { AccountPriceListOrmEntity } from '../../price-lists/infrastructure/database/account-price-list.orm-entity'
import { AnchorCatalogItemOrmEntity } from '../../price-lists/infrastructure/database/anchor-catalog-item.orm-entity'
import { PriceListLineOrmEntity } from '../../price-lists/infrastructure/database/price-list-line.orm-entity'
import { PriceListLinePriceOrmEntity } from '../../price-lists/infrastructure/database/price-list-line-price.orm-entity'
import { PriceListOrmEntity } from '../../price-lists/infrastructure/database/price-list.orm-entity'
import { TimeBandOrmEntity } from '../../price-lists/infrastructure/database/time-band.orm-entity'
import { QuoteEventOrmEntity } from '../../quotes/infrastructure/database/quote-event.orm-entity'
import { QuoteOrmEntity } from '../../quotes/infrastructure/database/quote.orm-entity'
import { WorkOrderEventOrmEntity } from '../../work-orders/infrastructure/database/work-order-event.orm-entity'
import { WorkOrderItemOrmEntity } from '../../work-orders/infrastructure/database/work-order-item.orm-entity'
import { WorkOrderOrmEntity } from '../../work-orders/infrastructure/database/work-order.orm-entity'

export const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://wemaintain:wemaintain@127.0.0.1:5432/wemaintain',
  entities: [
    QuoteEventOrmEntity,
    QuoteOrmEntity,
    WorkOrderOrmEntity,
    WorkOrderItemOrmEntity,
    WorkOrderEventOrmEntity,
    PartOrmEntity,
    CustomerOrmEntity,
    BuildingOrmEntity,
    DeviceOrmEntity,
    ContractOrmEntity,
    ContractDeviceOrmEntity,
    AnchorCatalogItemOrmEntity,
    PriceListOrmEntity,
    AccountPriceListOrmEntity,
    PriceListLineOrmEntity,
    PriceListLinePriceOrmEntity,
    TimeBandOrmEntity,
  ],
  synchronize: true,
})

export async function connect(): Promise<DataSource> {
  const admin = new DataSource({ ...dataSource.options, entities: [], synchronize: false } as typeof dataSource.options)
  await admin.initialize()
  for (const schema of ['workorders', 'contracts', 'users', 'buildings', 'devices', 'price_lists']) {
    await admin.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)
  }
  await admin.destroy()
  return dataSource.initialize()
}
