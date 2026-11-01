import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ schema: 'price_lists', name: 'time_band' })
export class TimeBandOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('varchar', { unique: true }) name: string
}
