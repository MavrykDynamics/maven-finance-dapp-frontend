import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'

// validation helper
/**
 *
 * @param value the actual value from input
 * @param myVaultNames all vault names
 * @returns tuple where the first element is error Message and the second one - validation status
 */
export function validateVaultName(value: string, myVaultNames: string[]): InputStatusType {
  if (myVaultNames.find((vaultName) => vaultName.trim().toLowerCase() === value?.trim().toLowerCase())) {
    return INPUT_STATUS_ERROR
  }

  return INPUT_STATUS_SUCCESS
}
