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

const LINDENHOME_AL = 44889

const COEFFICIENT_TARGETS: Record<string, string> = {
  '0097AS': 'part not on the price list',
  '5050AS': 'asbestos-removal subcontractor',
  '5510AS': 'subcontractor (excluding asbestos removal)',
}

const DEDUCTIONS: Record<string, { discountPct: number; minQuantity: number; maxQuantity: number | null }> = {
  '5600AS': { discountPct: 6, minQuantity: 11, maxQuantity: 50 },
  '5610AS': { discountPct: 8, minQuantity: 51, maxQuantity: null },
}

const LABOUR_BANDS: Record<string, string> = {
  '0001AS': TIME_BANDS.normal,
  '0002AS': TIME_BANDS.surcharged,
}

export type ParsedPrice = { timeBand: string | null; unitPrice: number }

export type ParsedLine = {
  code: string
  designation: string
  section: string
  kind: PriceListLineKind
  unitOfMeasure: string
  coefficientTarget: string | null
  coefficient: number | null
  discountPct: number | null
  minQuantity: number | null
  maxQuantity: number | null
  prices: ParsedPrice[]
}

export function mapLindenhomeRow(row: CsvRow): ParsedLine {
  const code = row.code.trim()
  const section = row.section.trim()
  const unitPrice = Number(row.unit_price_eur_excl_vat)
  const base = {
    code,
    designation: row.designation.trim(),
    section,
    unitOfMeasure: row.unit.trim(),
    coefficientTarget: null,
    coefficient: null,
    discountPct: null,
    minQuantity: null,
    maxQuantity: null,
  }

  if (section === 'HOURLY RATE') {
    return {
      ...base,
      kind: PriceListLineKind.LABOUR_RATE,
      prices: [{ timeBand: LABOUR_BANDS[code] ?? null, unitPrice }],
    }
  }

  if (section === 'COEFFICIENT') {
    return {
      ...base,
      kind: PriceListLineKind.COEFFICIENT,
      coefficientTarget: COEFFICIENT_TARGETS[code] ?? row.designation.trim(),
      coefficient: unitPrice,
      prices: [],
    }
  }

  if (section === 'DEDUCTIONS') {
    const deduction = DEDUCTIONS[code]
    const discountPct = Number(row.unit_price_eur_excl_vat.replace('%', ''))
    return {
      ...base,
      kind: PriceListLineKind.DEDUCTION,
      discountPct: deduction?.discountPct ?? discountPct,
      minQuantity: deduction?.minQuantity ?? null,
      maxQuantity: deduction?.maxQuantity ?? null,
      prices: [],
    }
  }

  return { ...base, kind: PriceListLineKind.LINE, prices: [{ timeBand: null, unitPrice }] }
}

export async function importLindenhome(db: DataSource, bands: Map<string, string>): Promise<void> {
  const rows = parseCsv(readFileSync(join(__dirname, '../../../../../exploration/price-lists/lindenhome-price-list.csv'), 'utf8'))
  const lines = rows.map(mapLindenhomeRow)

  await db.transaction(async (manager) => {
    const list = manager.create(PriceListOrmEntity, {
      id: randomUUID(),
      name: 'Lindenhome AL — Annex 2 (lot 4)',
      country: 'FR',
      currency: 'EUR',
      pattern: PriceListPattern.FIXED_PRICE,
      confidenceTier: 'contract-read',
      validFrom: null,
      validTo: null,
      source: 'Annex 2 to the works contract for lot 4',
      version: 1,
    })
    await manager.save(list)

    const entities = lines.map((line) =>
      manager.create(PriceListLineOrmEntity, {
        id: randomUUID(),
        priceListId: list.id,
        code: line.code,
        designation: line.designation,
        section: line.section,
        kind: line.kind,
        unitOfMeasure: line.unitOfMeasure,
        anchorCatalogItemId: null,
        coefficientTarget: line.coefficientTarget,
        coefficient: line.coefficient,
        discountPct: line.discountPct,
        minQuantity: line.minQuantity,
        maxQuantity: line.maxQuantity,
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
          timeBandId: price.timeBand ? (bands.get(price.timeBand) ?? null) : null,
          unitPrice: price.unitPrice,
        }),
      ),
    )
    await manager.save(prices)

    await manager.save(
      manager.create(AccountPriceListOrmEntity, { priceListId: list.id, customerId: LINDENHOME_AL }),
    )
  })
}
