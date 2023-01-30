import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.helpers'
import { Lending_Controller } from 'utils/generated/graphqlTypes'
import { BorrowingData } from './Loans'

export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>

export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type VaultType = Omit<BorrowingData, 'collateralData'> & {
  address: string
  ownerId: string
  vaultId: number
  status: string
  levelOfEarly: number
  levelOfLate: number
  creationTimestamp?: string  
  collateralData: CollateralType[]
}

export type CollateralType = {
  assetSymbol?: string
  assetIcon?: string
  balance: number
  assetRate: number
  maxWithdraw: number
  collateralShare: number
}
