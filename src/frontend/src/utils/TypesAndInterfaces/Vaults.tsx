import { normalizeVaultsStorage } from 'pages/Vaults/Vaults.helpers'
import { Vault, Lending_Controller_Vault } from 'utils/generated/graphqlTypes'

export type VaultGQL = Omit<Vault, '__typename'>
export type VaultsStorage = ReturnType<typeof normalizeVaultsStorage>

export type VaultsGQL = Omit<Lending_Controller_Vault, '__typename'>
