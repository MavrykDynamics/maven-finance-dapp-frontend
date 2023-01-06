import { normalizeVaults } from 'pages/Vaults/Vaults.helpers'
import { Vault } from 'utils/generated/graphqlTypes'

export type VaultGQL = Omit<Vault, '__typename'>
export type VaultsStorage = ReturnType<typeof normalizeVaults>
