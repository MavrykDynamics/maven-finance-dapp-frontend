import { LoansTokenMetadataType, TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import {
  BORROW_VAULT_ASSET_ACTION,
  CHANGE_BAKER_ACTION,
  CHANGE_VAULT_NAME_ACTION,
  CREATE_VAULT_ACTION,
  DEPOSIT_COLLATERAL_ACTION,
  MANAGE_PERMISSIONS_ACTION,
  REPAY_FULL_VAULT_ACTION,
  REPAY_PART_OF_VAULT_ACTION,
  UPDATE_OPERATORS_ACTION,
  WITHDRAW_COLLATERAL_ACTION,
} from './helpers/vaults.const'
import { VAULTS_ALL, VAULTS_DATA, VAULTS_USER_ALL, VAULTS_USER_DEPOSITOR } from './vaults.provider.consts'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import { ANY_USER, NONE_USER, WHITELIST_USERS } from 'pages/Loans/Loans.const'
import {
  GetUserAllVaultsQueryQuery,
  GetUserDepositorAllVaultsQueryQuery,
  GetAllVaultsQueryQuery,
} from 'utils/__generated__/graphql'

// actions type
export type VaultsActionsType =
  | typeof CHANGE_VAULT_NAME_ACTION
  | typeof BORROW_VAULT_ASSET_ACTION
  | typeof REPAY_PART_OF_VAULT_ACTION
  | typeof REPAY_FULL_VAULT_ACTION
  | typeof WITHDRAW_COLLATERAL_ACTION
  | typeof DEPOSIT_COLLATERAL_ACTION
  | typeof CHANGE_BAKER_ACTION
  | typeof MANAGE_PERMISSIONS_ACTION
  | typeof UPDATE_OPERATORS_ACTION
  | typeof CREATE_VAULT_ACTION

// context types
export type VaultsContext = VaultsCtxState & {
  changeVaultsSubscriptionsList: (skips: Partial<VaultsSubsRecordType>) => void
  setVaultsDashboardData: (newDashboardData: VaultsDashboardDataType) => void
  isLoading: boolean
}

export type VaultsDashboardDataType = {
  reducedVaultsCollaterals: Array<{
    balance: number
    chartColor: string
    tokenAddress: TokenAddressType
  }>
  totalCollateralRatio: number
  vaultTvl: number
  activeVaults: number
  averageCollateralRatio: number
}

export type VaultsCtxState = {
  vaultsMapper: Record<string, VaultType>
  permissionedVaultsIds: string[]
  myVaultsIds: string[]
  allVaultsIds: string[]
  vaultsDashboardData: null | VaultsDashboardDataType
}

export type NullableVaultsCtxState = DeepNullable<VaultsCtxState>

type VaultsSubType = typeof VAULTS_ALL | typeof VAULTS_USER_ALL | typeof VAULTS_USER_DEPOSITOR
export type VaultsSubsRecordType = {
  [VAULTS_DATA]: VaultsSubType | null
}

export type VaultsIndexerDataType =
  | GetUserAllVaultsQueryQuery
  | GetUserDepositorAllVaultsQueryQuery
  | GetAllVaultsQueryQuery

// TODO: add descr to liquidation fields while testing liquidation functionality and popup
export type VaultType = {
  // vault tokens data
  borrowedTokenAddress: TokenAddressType // address of borrowed token
  borrowedAmount: number // amount of token that user/s have borrowed from the vault *after normalizer it's not converted to client format*
  fee: number // amount of token that user will have to pay after he has borrowed from the vault *after normalizer it's not converted to client format*
  collateralData: Array<CollateralType> // collaterals of the vault in format {amount, tokenAddress} *after normalizer amount is not converted to the client format*

  // vault metadata
  name: string // name of the vault
  address: string // address of the vault
  vaultId: number // id of the vault

  // liquidation data
  liquidationLvl: number | null // level when vault will be able to liquidate (liquidation delay + liquidation block), to use it we need to convert it to timestamp, if null vault is not liquidatable
  liquidationMax: number
  liquidationReward: number
  liquidationRatio: number
  adminLiquidateFee: number

  // permissions
  xtzDelegatedTo: string | null // if vault has xtz, as collateral, those xtz can be delegated to baker, here's the address of the delegated baker
  sMVKDelegatedTo?: string // if vault has smvk, as collateral, those smvk can be delegated to satellite, here's the address of the delegated satellite
  ownerAddress: string // address of the vault owner
  depositors: Array<string> // list of people who are allowed to deposit in the vault
  deporsitorsFlag: DepositorsFlagType // vault has 3 permissions states any -≥ anyone can deposit in it, none -> only owner can, whitelist -> only allowed users can deposit

  // Additional fields for vaults page
  minimumRepay: number // minimun amount of token that user can repay
  apr: number // interest rate the user is charged for borrowing
  availableLiquidity: number // how much token avaliable in a pool, user to calc borrowCapacity of the vault *after normalizer it's not converted to client format*
  creationTimestamp: number // creation timestamp of the vault
}

// those additional fields can be only calculated after normalization stage, cuz those calcs requiring tokensDecimals & tokensRates
export type FullLoansVaultType = VaultType & {
  liquidationTimestamp: number | null // same as liquidationLvl but converted to timestamp
  totalOutstanding: number // fee + borrowed amount in USD
  collateralBalance: number // sum of collaterals in USD
  borrowCapacity: number // how mush user can borrow from vault (avaliable liq | amount of token while collateral ration >= 200%)
  liquidationPrice: number
  collateralRatio: number // relation of collaterals in vault to borrowed amount
  status: (typeof vaultsStatuses)[keyof typeof vaultsStatuses] // status of the vault, depends on collateralRatio
  borrowedToken: LoansTokenMetadataType & { rate: number } // metadata of borrowed token
}

export type DepositorsFlagType = typeof ANY_USER | typeof NONE_USER | typeof WHITELIST_USERS

export type CollateralType = {
  amount: number
  tokenAddress: TokenAddressType
}

export type VaultAssetData = {
  balance: number
  chartColor: string
  tokenAddress: string
}
