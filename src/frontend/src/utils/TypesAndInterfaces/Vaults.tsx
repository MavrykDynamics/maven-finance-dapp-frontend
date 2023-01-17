import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.helpers'
import { Lending_Controller, Lending_Controller_Vault } from 'utils/generated/graphqlTypes'
import { BorrowingData } from './Loans'

export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>
export type LendingControllerVaultGQL = Omit<Lending_Controller_Vault, '__typename'>

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
