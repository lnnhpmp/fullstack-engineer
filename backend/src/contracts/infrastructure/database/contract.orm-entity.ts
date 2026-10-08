import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ContractType } from '../../domain/contract'

@Entity({ schema: 'contracts', name: 'contract' })
export class ContractOrmEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() customerId: number
  @Column({ unique: true }) contractNo: string
  @Column({ type: 'enum', enum: ContractType, default: ContractType.BASIC }) type: ContractType
  @Column('float') amount: number
  @Column('timestamptz') startDate: Date
  @Column('timestamptz') endDate: Date
}
