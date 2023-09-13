import React, { useMemo, useState } from 'react'

// view
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { FormStyled } from './BreakGlassCouncilForm.style'
import Icon from 'app/App.components/Icon/Icon.view'

// consts
import { SET_ALL_CONTRACTS_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { INPUT_STATUS_DEFAULT, InputStatusType } from 'app/App.components/Input/Input.constants'

// utils
import { setAllContractsAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const INIT_FORM = {
  newAdminAddress: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newAdminAddress: INPUT_STATUS_DEFAULT,
}

export function FormSetAllContractsAdminView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newAdminAddress } = form

  const setAllContractsAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_ALL_CONTRACTS_ADMIN_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await setAllContractsAdmin(breakGlassAddress, newAdminAddress)
      },
    }),
    [breakGlassAddress, newAdminAddress, userAddress],
  )

  const { action: handleSetAllContractAdmin } = useContractAction(setAllContractsAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetAllContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormSetAllContractsAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const inputProps = {
    name: 'newAdminAddress',
    value: newAdminAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const inputSettings = {
    inputStatus: formInputStatus.newAdminAddress,
  }

  return (
    <FormStyled>
      <h1>Set All Contracts Admin</h1>
      <p>Please enter valid function parameters for setting admin</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>

          <Input inputProps={inputProps} settings={inputSettings} />
        </div>

        <div className="btn-wrapper">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="profile" />
            Set Contracts Admin
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
