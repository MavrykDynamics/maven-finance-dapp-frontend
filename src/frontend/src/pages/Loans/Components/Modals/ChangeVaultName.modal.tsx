import { useLockBodyScroll } from 'react-use'
import { useCallback, useEffect, useMemo, useState } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'

// actions
import { changeVaultNameAction } from 'providers/VaultsProvider/actions/vaults.actions'

// consts
import {
  ERR_MSG_INPUT,
  ERR_MSG_NONE,
  INPUT_LARGE,
  INPUT_STATUS_SUCCESS,
  INPUT_STATUS_DEFAULT,
  InputStatusType,
} from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CHANGE_VAULT_NAME_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

// helpers
import { validateVaultName } from './CreateNewVault.modal'
import { containSpaces } from 'app/App.utils/input'

// types
import { ChangeVaultNamePopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'

// styles
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// providers
import { useUserVaultsNames } from 'providers/VaultsProvider/hooks/useVaultsNames'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { validateInputLength } from 'app/App.utils/input/validateInput'

const VAULT_NAME_INPUT: {
  name: string
  validationStatus: InputStatusType
  errorMessage: string
} = {
  name: '',
  validationStatus: INPUT_STATUS_DEFAULT,
  errorMessage: '',
}

export const ChangeVaultName = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ChangeVaultNamePopupDataType
}) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const { vaultNames, isLoading: isVaultsNamesLoading } = useUserVaultsNames()

  useLockBodyScroll(show)

  const [newVaultName, setNewVaultName] = useState(VAULT_NAME_INPUT)

  useEffect(() => {
    if (!show) {
      setNewVaultName(VAULT_NAME_INPUT)
    }
  }, [show])

  const { vaultAddress = '', vaultName = '' } = data ?? {}

  // change name action -------------------
  const changeNameAction = useCallback(async () => {
    // is there is a vault address - do nothing
    if (!vaultAddress) {
      return null
    }

    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    return await changeVaultNameAction(newVaultName.name, vaultAddress, closePopup)
  }, [bug, closePopup, newVaultName.name, userAddress, vaultAddress])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CHANGE_VAULT_NAME_ACTION,
      actionFn: changeNameAction,
    }),
    [changeNameAction],
  )

  const { action: changeVaultNameHandler } = useContractAction(contractActionProps)

  if (!data) return null

  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setNewVaultName((prev) => ({ ...prev, name: value }))
  }

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      setNewVaultName((prev) => ({ ...prev, name: trimmedValue }))
    }
  }

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <H2Title>Change Vault Name</H2Title>

          <div className="modalDescr">Please enter a new name.</div>

          <div className="block-name" style={{ marginBottom: '20px' }}>
            <ThreeLevelListItem>
              <div className="name">Vault Name</div>
              <div className="value">{vaultName}</div>
            </ThreeLevelListItem>
          </div>

          <div className="block-name">New Vault Name</div>

          <Input
            inputProps={{
              value: newVaultName.name,
              type: 'text',
              onChange: handleVaultNameChange,
              onBlur: handleOnBlur,
              placeholder: 'e.g. Satoshi’s Personal Vault',
            }}
            settings={{
              inputStatus: newVaultName.validationStatus,
              inputSize: INPUT_LARGE,
              validationFns: [
                [validateInputLength, ERR_MSG_INPUT, [15]],
                [validateVaultName, ERR_MSG_NONE, [vaultNames]],
              ],
              updateInputStatus: (newInputStatus) =>
                setNewVaultName((prev) => ({ ...prev, validationStatus: newInputStatus })),
              allowInputAfterError: true,
            }}
          />

          <div className="confirmation-btn">
            <NewButton
              kind={BUTTON_PRIMARY}
              form={BUTTON_WIDE}
              onClick={changeVaultNameHandler}
              disabled={newVaultName.validationStatus !== INPUT_STATUS_SUCCESS || !vaultAddress}
            >
              <Icon id="doubleCheckmark" />
              Change
            </NewButton>
          </div>
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
