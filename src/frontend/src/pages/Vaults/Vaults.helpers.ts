import { VaultGQL, VaultsGQL } from 'utils/TypesAndInterfaces/Vaults'

type VaultsStorageProps = {
  vault: Array<VaultGQL>
}

export const normalizeVaultsStorage = (storage: VaultsStorageProps) => {
  const { vault = [] } = storage

  if (!vault.length) return []

  return vault.map((item) => {
    return {
      ...item
    }
  })
}

type VaultsProps = {
  vaults: Array<VaultsGQL>
}

export const normalizeVaults = (storage: VaultsProps) => {
  const { vaults } = storage
  console.log("🚀 ~ file: Vaults.helpers.ts:25 ~ normalizeVaults ~ vaults", vaults)

  if (!vaults.length) return []

  const result = vaults

  return []
}
