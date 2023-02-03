import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.helpers'
import { Lending_Controller } from 'utils/generated/graphqlTypes'
import { LoansVaultType } from './Loans'

export type LendingControllerGQL = Omit<Lending_Controller, '__typename'>

export type VaultsStorage = Awaited<ReturnType<typeof normalizeVaultsStorage>>

export type VaultType = LoansVaultType & {
  status: string
  ownerId: string
  creationTimestamp?: string
  liquidationMax: number
  liquidationReward: number
  adminLiquidateFee: number
}
