import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.helpers'
import { Vault, Lending_Controller } from 'utils/generated/graphqlTypes'
import { BorrowingData } from './Loans'

export type VaultGQL = Omit<Vault, '__typename'>
export type VaultsStorage = ReturnType<typeof normalizeVaultsStorage>

export type VaultType = Omit<BorrowingData, 'collateralData'> & {
  address: string
  ownerId: string

  collateralData: CollateralType[]
}

export type CollateralType = {
  assetSymbol?: string
  assetIcon?: string
  balance: number
  assetRate: number | null
  maxWithdraw: number
  collateralShare: number
}

export type VaultsGQL = Omit<Lending_Controller, '__typename'>
