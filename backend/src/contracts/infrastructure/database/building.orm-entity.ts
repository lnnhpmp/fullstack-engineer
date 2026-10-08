import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { CustomerOrmEntity } from './customer.orm-entity'

@Entity({ schema: 'buildings', name: 'building' })
export class BuildingOrmEntity {
  @PrimaryColumn() id: string
  @Column({ name: 'buildingName' }) name: string
  @Column() addressLine1: string
  @Column() zipcode: string
  @Column() city: string
  @Column('varchar', { length: 2 }) countryCode: string
  @Column() customerId: number
  @ManyToOne(() => CustomerOrmEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'customerId' })
  customer?: CustomerOrmEntity
}
