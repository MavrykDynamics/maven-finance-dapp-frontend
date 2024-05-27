// validation helper

import { SAME_VAULT_NAME_ERROR } from './createNewVault.consts'

/**
 *
 * @param value the actual value from input
 * @param myVaultNames all vault names
 * @returns a tuple where tuple[0] indicates for error (f.e. hasError), tuple[1] is the actual err message
 */
export function validateVaultName(value: string, myVaultNames: string[]) {
  console.log(myVaultNames, 'myVaultNames')
  if (myVaultNames.find((vaultName) => vaultName.trim().toLowerCase() === value?.trim().toLowerCase())) {
    return [true, SAME_VAULT_NAME_ERROR] as const
  }

  return [false, null] as const
}
