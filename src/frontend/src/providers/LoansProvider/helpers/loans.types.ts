import { SubscriptionSkipType } from 'utils/api/apollo.consts'

export type LoansChartsSubsSkipsType = {
  skipGenLendingSubsciption?: SubscriptionSkipType
  skipGenBorrowingSubsciption?: SubscriptionSkipType
  skipGenCollateralSubsciption?: SubscriptionSkipType
}
