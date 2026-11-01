import { randomUUID } from 'node:crypto'
import type { DataSource } from 'typeorm'
import { TIME_BANDS } from '../../domain/price-list'
import { TimeBandOrmEntity } from '../database/time-band.orm-entity'
import { importLindenhome } from './lindenhome.importer'
import { importMeridian } from './meridian.importer'

const BAND_NAMES = [
  TIME_BANDS.normal,
  TIME_BANDS.surcharged,
  TIME_BANDS.officeHours,
  TIME_BANDS.afterOfficeHours,
  TIME_BANDS.satPmSunPh,
]

/** Idempotent: truncates price-list tables, then reloads both C1 lists from the exploration CSVs. */
export async function seedPriceLists(db: DataSource): Promise<void> {
  await db.query(
    `TRUNCATE price_lists.anchor_catalog_item, price_lists.account_price_list,
              price_lists.price_list_line_price, price_lists.price_list_line,
              price_lists.price_list, price_lists.time_band CASCADE`,
  )

  const repository = db.getRepository(TimeBandOrmEntity)
  const bands = await repository.save(
    BAND_NAMES.map((name) => repository.create({ id: randomUUID(), name })),
  )
  const byName = new Map(bands.map((band) => [band.name, band.id]))

  await importLindenhome(db, byName)
  await importMeridian(db, byName)
}
