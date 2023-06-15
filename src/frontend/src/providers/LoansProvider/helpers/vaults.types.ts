import { TokenType } from 'utils/TypesAndInterfaces/General'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

export type FullLoansVaultType = LoansVaultType & {
  totalOutstanding: number
  collateralBalance: number
  borrowCapacity: number
  collateralRatio: number
  // TODO: implement & add types
  status: string
}

export type DepositCollateralType = {
  collateralName: string
  amount: number
  id: number
  address: string
  type: TokenType
}
