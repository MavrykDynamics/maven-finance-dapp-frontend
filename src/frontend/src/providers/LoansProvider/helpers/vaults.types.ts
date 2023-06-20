import { ANY_USER, NONE_USER, WHITELIST_USERS } from 'pages/Loans/Loans.const'
import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import { TokenType } from 'utils/TypesAndInterfaces/General'

export type DepositorsFlagType = typeof ANY_USER | typeof NONE_USER | typeof WHITELIST_USERS

export type CollateralType = {
  amount: number
  tokenAddress: TokenAddressType
}

export type VaultType = {
  // vault tokens data
  borrowedTokenAddress: TokenAddressType
  borrowedAmount: number
  fee: number
  collateralData: Array<CollateralType>

  // vault metadata
  name: string
  address: string
  vaultId: number

  // liquidation data
  liquidationLvl: number
  liquidationMax: number
  liquidationReward: number
  liquidationRatio: number
  adminLiquidateFee: number

  // permissions
  xtzDelegatedTo: string | null
  sMVKDelegatedTo?: string
  ownerId: string
  depositors: Array<string>
  deporsitorsFlag: DepositorsFlagType

  // Additional fields for vaults page
  minimumRepay: number
  apr: number
  availableLiquidity: number
  creationTimestamp?: number
}

export type FullLoansVaultType = VaultType & {
  totalOutstanding: number // fee + borrowed amount
  collateralBalance: number // sum of collaterals in USD
  borrowCapacity: number // how mush user can borrow from vault
  collateralRatio: number // relation of collaterals in vault to borrowed amount
  status: string // status of the vault, depends on collateralRatio
}

export type DepositCollateralType = {
  collateralName: string
  amount: number
  id: number
  address: string
  type: TokenType
}

export type VaultAssetData = {
  balance: number
  chartColor: string
  tokenAddress: string
}
