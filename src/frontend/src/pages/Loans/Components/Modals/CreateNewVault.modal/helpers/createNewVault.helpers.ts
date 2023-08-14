import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'

// validation helper
export function validateVaultName(value: string, myVaultNames: string[]): InputStatusType {
  return value &&
    value.length <= 15 &&
    !myVaultNames.find((vaultName) => vaultName.trim().toLowerCase() === value.trim().toLowerCase())
    ? INPUT_STATUS_SUCCESS
    : INPUT_STATUS_ERROR
}
