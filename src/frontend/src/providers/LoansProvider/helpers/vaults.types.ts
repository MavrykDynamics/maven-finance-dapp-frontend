import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

export type FullLoansVaultType = LoansVaultType & {
  totalOutstanding: number
  collateralBalance: number
  borrowCapacity: number
  collateralRatio: number
  // TODO: implement & add types
  status: string
}
