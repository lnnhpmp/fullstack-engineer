import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { BuildingOrmEntity } from './building.orm-entity'

@Entity({ schema: 'devices', name: 'device' })
export class DeviceOrmEntity {
  @PrimaryColumn() id: string
  @Column() deviceNo: string
  @Column() buildingId: string
  @ManyToOne(() => BuildingOrmEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'buildingId' })
  building?: BuildingOrmEntity
}
