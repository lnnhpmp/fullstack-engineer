import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ContractOrmEntity } from './contract.orm-entity'

@Entity({ schema: 'contracts', name: 'contract_device' })
export class ContractDeviceOrmEntity {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column() @Index() deviceId: string
  @Column('uuid') contractId: string
  @Column('float') amount: number
  @Column('timestamptz') startDate: Date
  @Column('timestamptz') endDate: Date
  @Column({ default: false }) isTerminated: boolean
  @DeleteDateColumn({ type: 'timestamptz', nullable: true }) deletedAt: Date | null
  @ManyToOne(() => ContractOrmEntity)
  @JoinColumn({ name: 'contractId' })
  contract?: ContractOrmEntity
}
