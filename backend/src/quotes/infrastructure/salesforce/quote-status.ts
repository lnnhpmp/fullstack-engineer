import { QuoteStatus } from '../../domain/quote'

export enum QuoteStatusesSF {
  Draft = 'Draft',
  Presented = 'Presented',
  PreAccepted = 'Pre-Accepted',
  Accepted = 'Accepted',
  WorksInProgress = 'Works in progress',
  ToBeBilled = 'To be billed',
  Billed = 'Billed',
  Denied = 'Denied',
}

export const QuoteStatusesSFtoDomain: { [key in QuoteStatusesSF]: QuoteStatus } = {
  [QuoteStatusesSF.Draft]: QuoteStatus.DRAFT,
  [QuoteStatusesSF.Presented]: QuoteStatus.TO_SIGN,
  [QuoteStatusesSF.PreAccepted]: QuoteStatus.VALIDATION,
  [QuoteStatusesSF.Accepted]: QuoteStatus.SIGNED,
  [QuoteStatusesSF.WorksInProgress]: QuoteStatus.WORKS_IN_PROGRESS,
  [QuoteStatusesSF.ToBeBilled]: QuoteStatus.TO_BE_BILLED,
  [QuoteStatusesSF.Billed]: QuoteStatus.BILLED,
  [QuoteStatusesSF.Denied]: QuoteStatus.REFUSED,
}
