import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { LoansVaultType } from 'utils/TypesAndInterfaces/Loans'

export type FullLoansVaultType = LoansVaultType & {
  totalOutstanding: number
  collateralBalance: number
  borrowCapacity: number
  collateralRatio: number
  borrowedTokenRate: number
  borrowedTokenMetadata: TokenMetadataType
  // TODO: implement
  status: string
}
