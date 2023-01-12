import { VaultGQL } from 'utils/TypesAndInterfaces/Vaults'

type VaultProps = {
  vault: Array<VaultGQL>
}

export const normalizeVaults = (storage: VaultProps) => {
  const { vault = [] } = storage

  if (!vault.length) return []

  return vault.map((item) => {
    return {
      ...item
    }
  })
}
