import React, { useCallback } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { Input } from 'app/App.components/Input/NewInput'

// consts
import {
  ERR_MSG_INPUT,
  ERR_MSG_NONE,
  INPUT_LARGE,
  INPUT_STATUS_SUCCESS,
} from 'app/App.components/Input/Input.constants'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// providers
import { useCreateVaultContext } from '../context/createVaultModalContext'

// utils
import { validateVaultName } from '../helpers/createNewVault.helpers'
import { containSpaces } from 'app/App.utils/input'

// hooks
import { useUserVaultsNames } from 'providers/VaultsProvider/hooks/useVaultsNames'
import { validateInputLength } from 'app/App.utils/input/validateInput'

export const CreateVaultScreen = () => {
  const { vaultNames } = useUserVaultsNames()
  const { vaultInputState, updateInputVaultState, updateScreenToShow } = useCreateVaultContext()

  // handlers
  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    updateInputVaultState({ name: value, validationStatus: INPUT_STATUS_SUCCESS })
  }

  const handleVaultNameOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      updateInputVaultState({ name: trimmedValue })
    }
  }

  const handleButtonClick = useCallback(async () => {
    updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)
  }, [updateScreenToShow])

  return (
    <>
      <Input
        inputProps={{
          value: vaultInputState.name,
          type: 'text',
          onChange: handleVaultNameChange,
          onBlur: handleVaultNameOnBlur,
          placeholder: 'e.g. Satoshi’s Personal Vault',
        }}
        settings={{
          inputStatus: vaultInputState.validationStatus,
          inputSize: INPUT_LARGE,
          errorMessage: vaultInputState.errorMessage,
          validationFns: [
            [validateInputLength, ERR_MSG_INPUT, [15]],
            [validateVaultName, ERR_MSG_NONE, [vaultNames]],
          ],
          allowInputAfterError: true,
        }}
      />
      <div className="manage-btn">
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={handleButtonClick}
          disabled={vaultInputState.validationStatus !== INPUT_STATUS_SUCCESS}
        >
          Continue
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </>
  )
}
