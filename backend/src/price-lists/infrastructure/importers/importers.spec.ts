import { PriceListLineKind, TIME_BANDS } from '../../domain/price-list'
import { parseCsv } from './csv'
import { mapLindenhomeRow } from './lindenhome.importer'
import { mapMeridianRow } from './meridian.importer'

describe('price-list importers', () => {
  it('parses quoted commas and escaped quotes', () => {
    const [row] = parseCsv('code,designation\n0001AS,"A, quoted ""value"""\n')
    expect(row).toEqual({ code: '0001AS', designation: 'A, quoted "value"' })
  })

  it('maps Lindenhome labour to its time band', () => {
    const line = mapLindenhomeRow({
      code: '0002AS',
      section: 'HOURLY RATE',
      designation: 'Surcharged hourly rate (travel included)',
      unit: 'h',
      unit_price_eur_excl_vat: '108.97',
      comment: '',
    })
    expect(line.kind).toBe(PriceListLineKind.LABOUR_RATE)
    expect(line.prices).toEqual([{ timeBand: TIME_BANDS.surcharged, unitPrice: 108.97 }])
  })

  it('maps Lindenhome coefficients and volume deductions', () => {
    const coefficient = mapLindenhomeRow({
      code: '0097AS',
      section: 'COEFFICIENT',
      designation: 'Coefficient on a part not on the price list',
      unit: 'coefficient (e.g. 1.07)',
      unit_price_eur_excl_vat: '1.41',
      comment: '',
    })
    expect(coefficient.kind).toBe(PriceListLineKind.COEFFICIENT)
    expect(coefficient.coefficient).toBe(1.41)
    expect(coefficient.prices).toEqual([])

    const deduction = mapLindenhomeRow({
      code: '5600AS',
      section: 'DEDUCTIONS',
      designation: 'Unit discount for an order of 11 to 50 units',
      unit: '%',
      unit_price_eur_excl_vat: '6%',
      comment: '',
    })
    expect(deduction.kind).toBe(PriceListLineKind.DEDUCTION)
    expect(deduction).toMatchObject({ discountPct: 6, minQuantity: 11, maxQuantity: 50 })
  })

  it('maps Meridian rows into three bands and identifies the man-hour line as labour', () => {
    const line = mapMeridianRow({
      no: '65',
      description: 'Standby technician',
      uom: 'Per Man-hr',
      office_hours_sgd: '111.00',
      after_office_hours_sgd: '167.00',
      sat_pm_sun_ph_sgd: '222.00',
    })
    expect(line.kind).toBe(PriceListLineKind.LABOUR_RATE)
    expect(line.prices.map((price) => price.timeBand)).toEqual([
      TIME_BANDS.officeHours,
      TIME_BANDS.afterOfficeHours,
      TIME_BANDS.satPmSunPh,
    ])
    expect(line.prices.map((price) => price.unitPrice)).toEqual([111, 167, 222])
  })
})
