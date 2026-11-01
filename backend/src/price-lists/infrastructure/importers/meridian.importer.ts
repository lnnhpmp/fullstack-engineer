import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DataSource } from 'typeorm'
import { PriceListLineKind, PriceListPattern, TIME_BANDS } from '../../domain/price-list'
import { AccountPriceListOrmEntity } from '../database/account-price-list.orm-entity'
import { PriceListLineOrmEntity } from '../database/price-list-line.orm-entity'
import { PriceListLinePriceOrmEntity } from '../database/price-list-line-price.orm-entity'
import { PriceListOrmEntity } from '../database/price-list.orm-entity'
import { parseCsv, type CsvRow } from './csv'

const MERIDIAN_CUSTOMERS = [87050, 80174, 89840, 43375, 73295, 86663]

export type MeridianLine = {
  code: string
  designation: string
  kind: PriceListLineKind
  unitOfMeasure: string
  prices: { timeBand: string; unitPrice: number }[]
}

export function mapMeridianRow(row: CsvRow): MeridianLine {
  const unitOfMeasure = row.uom.trim()
  return {
    code: String(row.no).trim(),
    designation: row.description.trim(),
    kind: /man-?hr/i.test(unitOfMeasure) ? PriceListLineKind.LABOUR_RATE : PriceListLineKind.LINE,
    unitOfMeasure,
    prices: [
      { timeBand: TIME_BANDS.officeHours, unitPrice: Number(row.office_hours_sgd) },
      { timeBand: TIME_BANDS.afterOfficeHours, unitPrice: Number(row.after_office_hours_sgd) },
      { timeBand: TIME_BANDS.satPmSunPh, unitPrice: Number(row.sat_pm_sun_ph_sgd) },
    ],
  }
}

export async function importMeridian(db: DataSource, bands: Map<string, string>): Promise<void> {
  const rows = parseCsv(readFileSync(join(__dirname, '../../../../../exploration/price-lists/meridian-sor-table-a.csv'), 'utf8'))
  const lines = rows.map(mapMeridianRow)

  await db.transaction(async (manager) => {
    const list = manager.create(PriceListOrmEntity, {
      id: randomUUID(),
      name: 'Meridian SOR Table A',
      country: 'SG',
      currency: 'SGD',
      pattern: PriceListPattern.FIXED_PRICE,
      confidenceTier: 'contract-read',
      validFrom: null,
      validTo: null,
      source: 'Section V Schedule of Rates, Table A (maintenance agreements)',
      version: 1,
    })
    await manager.save(list)

    const entities = lines.map((line) =>
      manager.create(PriceListLineOrmEntity, {
        id: randomUUID(),
        priceListId: list.id,
        code: line.code,
        designation: line.designation,
        section: null,
        kind: line.kind,
        unitOfMeasure: line.unitOfMeasure,
        anchorCatalogItemId: null,
        coefficientTarget: null,
        coefficient: null,
        discountPct: null,
        minQuantity: null,
        maxQuantity: null,
        validFrom: null,
        validTo: null,
      }),
    )
    await manager.save(entities)

    const prices = lines.flatMap((line, index) =>
      line.prices.map((price) =>
        manager.create(PriceListLinePriceOrmEntity, {
          id: randomUUID(),
          lineId: entities[index].id,
          timeBandId: bands.get(price.timeBand) ?? null,
          unitPrice: price.unitPrice,
        }),
      ),
    )
    await manager.save(prices)

    await manager.save(
      MERIDIAN_CUSTOMERS.map((customerId) =>
        manager.create(AccountPriceListOrmEntity, { priceListId: list.id, customerId }),
      ),
    )
  })
}
