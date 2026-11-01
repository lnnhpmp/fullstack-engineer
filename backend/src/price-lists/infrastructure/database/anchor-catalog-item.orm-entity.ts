import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ schema: 'price_lists', name: 'anchor_catalog_item' })
export class AnchorCatalogItemOrmEntity {
  @PrimaryColumn('uuid') id: string
  @Column('varchar') name: string
  @Column('text', { array: true, nullable: true }) aliases: string[] | null
}
