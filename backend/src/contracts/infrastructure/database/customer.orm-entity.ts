import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ schema: 'users', name: 'customer' })
export class CustomerOrmEntity {
  @PrimaryColumn() id: number
  @Column() companyName: string
  @Column('varchar', { length: 2 }) countryCode: string
}
