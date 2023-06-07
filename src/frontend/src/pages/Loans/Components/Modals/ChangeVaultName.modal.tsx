import { useDispatch, useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'
import { useEffect, useState } from 'react'

import { INPUT_LARGE, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { ChangeVaultNamePopupDataType, VaultNameInputStateType } from './Modals.helpers'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'

import { LoansModalBase } from './Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { State } from 'reducers'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { changeVaultNameAction } from 'pages/Loans/Actions/vault.actions'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { validateVaultLength } from './CreateNewVault.modal'
import { containSpaces } from 'app/App.utils/input'

export const ChangeVaultName = ({
  closePopup,
  show,
  data,
}: {
  closePopup: () => void
  show: boolean
  data: ChangeVaultNamePopupDataType
}) => {
  const dispatch = useDispatch()
  const { vaultAddress, vaultName } = data ?? {}

  const {
    vaults: { myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const [newVaultName, setNewVaultName] = useState<VaultNameInputStateType>({
    name: '',
    validationStatus: '',
    errorMessage: '',
  })

  useLockBodyScroll(show)
  useEffect(() => {
    if (!show) {
      setNewVaultName({ name: '', validationStatus: '', errorMessage: '' })
    }
  }, [show])

  // handle vaultName input TODO: mb add debounce cuz of find operation
  const handleVaultNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const validationStatus = validateVaultLength(value, myVaultsIds, vaultsMapper)
    setNewVaultName((prev) => ({ ...prev, name: value, validationStatus }))
  }

  const changeVaultNameHandler = async () => {
    if (!vaultAddress) return

    await dispatch(
      changeVaultNameAction(
        newVaultName.name,
        vaultAddress,

        closePopup,
      ),
    )
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
              disabled={newVaultName.validationStatus !== INPUT_STATUS_SUCCESS}
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
