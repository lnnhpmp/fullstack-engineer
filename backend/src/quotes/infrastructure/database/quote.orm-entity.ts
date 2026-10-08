import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ schema: 'workorders', name: 'quote' })
export class QuoteOrmEntity {
  @PrimaryColumn('varchar', { length: 18 })
  public id!: string

  @Column()
  public status!: string

  @Column()
  public customerId!: number

  @Column({ default: 0 })
  public grandTotal!: number

  @Column({ nullable: true })
  public expirationDate?: Date

  @Column({ nullable: true })
  public acceptedDate?: Date

  @Column({ nullable: true })
  public sentDate?: Date

  @Column({ nullable: true })
  public toBeBilledDate?: Date

  @Column({ nullable: true })
  public workEndDate?: Date

  @Column()
  public currencyIsoCode!: string
}
