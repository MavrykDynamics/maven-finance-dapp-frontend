import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'

// actions
import { changeVaultNameAction } from 'providers/VaultsProvider/actions/vaults.actions'

// consts
import { INPUT_LARGE, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { CHANGE_VAULT_NAME_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'

// helpers
import { sleep } from 'utils/api/sleep'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { validateVaultLength } from './CreateNewVault.modal'
import { containSpaces } from 'app/App.utils/input'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { unknownToError } from 'errors/error'

// types
import { ChangeVaultNamePopupDataType } from '../../../../providers/LoansProvider/helpers/LoansModals.types'
import { TezosWalletErrorPayload } from 'errors/error.type'

// styles
import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// providers
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const ChangeVaultName = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ChangeVaultNamePopupDataType
}) => {
  // TODO: test it
  const {
    myVaultsIds: { all: myVaultsIds },
    vaultsMapper,
  } = useVaultsContext()
  const { userAddress } = useUserContext()
  const { setAction, toggleActionCompletion, toggleActionFullScreenLoader } = useDappConfigContext()
  const { bug, loading, info } = useToasterContext()

  useLockBodyScroll(show)

  const [newVaultName, setNewVaultName] = useState<{
    name: string
    validationStatus: InputStatusType
    errorMessage: string
  }>({
    name: '',
    validationStatus: '',
    errorMessage: '',
  })

  useEffect(() => {
    if (!show) {
      setNewVaultName({ name: '', validationStatus: '', errorMessage: '' })
    }
  }, [show])

  if (!data) return null

  const { vaultAddress, vaultName } = data

  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const validationStatus = validateVaultLength(value, myVaultsIds, vaultsMapper)
    setNewVaultName((prev) => ({ ...prev, name: value, validationStatus }))
  }

  const changeVaultNameHandler = async () => {
    if (!vaultAddress) {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return
      }

      try {
        const actionResult = await changeVaultNameAction(newVaultName.name, vaultAddress, closePopup)

        if (checkIfActionSuccess(actionResult)) {
          const { operation } = actionResult
          toggleActionFullScreenLoader(true)
          toggleActionCompletion(true)

          info(
            TOASTER_ACTIONS_TEXTS[CHANGE_VAULT_NAME_ACTION]['start']['message'],
            TOASTER_ACTIONS_TEXTS[CHANGE_VAULT_NAME_ACTION]['start']['title'],
          )

          await sleep(5000)

          // show toaster loader after 5000ms after operation started
          const toasterId = loading(
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
          )

          toggleActionFullScreenLoader(false)

          const operationConfirm = await operation.confirmation()
          const operationLvl = operationConfirm.block.header.level

          setAction({ actionName: CHANGE_VAULT_NAME_ACTION, toasterId, operationLvl })
        } else if (isContractErrorPayload(actionResult.error)) {
          const { message, description } = actionResult.error as TezosWalletErrorPayload
          bug(description, message)
        } else {
          throw new Error(actionResult.error.message)
        }
      } catch (e) {
        setAction(null)
        const parsedError = unknownToError(e)
        bug(parsedError.message)
      }
    }
  }

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (containSpaces(e.target.value)) {
      const trimmedValue = e.target.value.trim()
      const validationStatus = validateVaultLength(trimmedValue, myVaultsIds, vaultsMapper)
      setNewVaultName((prev) => ({ ...prev, validationStatus, name: trimmedValue }))
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
