export enum PriceListPattern {
  FIXED_PRICE = 'B',
  FIXED_MARKUP = 'A',
}

export enum PriceListLineKind {
  LINE = 'LINE',
  LABOUR_RATE = 'LABOUR_RATE',
  COEFFICIENT = 'COEFFICIENT',
  DEDUCTION = 'DEDUCTION',
}

export const TIME_BANDS = {
  normal: 'normal',
  surcharged: 'surcharged',
  officeHours: 'office-hours',
  afterOfficeHours: 'after-office-hours',
  satPmSunPh: 'sat-pm-sun-ph',
} as const
