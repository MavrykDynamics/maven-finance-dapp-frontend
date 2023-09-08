import React, { useCallback, useMemo, useState } from 'react'

// components
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// types
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// styles
import { FormStyled } from './BreakGlassCouncilForm.style'

// actions
import { setAllContractsAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// utils
import { validateFormAddress } from 'utils/validatorFunctions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { SET_ALL_CONTRACTS_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/breakGlassCouncil.consts'

const INIT_FORM = {
  newAdminAddress: '',
}

export function FormSetAllContractsAdminView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAdminAddress: '',
  })

  const { newAdminAddress } = form

  const setAllContractsAdminAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!breakGlassAddress) {
      bug('Wrong breakGlass address')
      return null
    }

    return await setAllContractsAdmin(breakGlassAddress, newAdminAddress)
  }, [userAddress, breakGlassAddress, newAdminAddress, bug])

  const setAllContractsAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_ALL_CONTRACTS_ADMIN_ACTION,
      actionFn: setAllContractsAdminAction,
    }),
    [setAllContractsAdminAction],
  )

  const { action: handleSetAllContractAdmin } = useContractAction(setAllContractsAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetAllContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus({
        newAdminAddress: '',
      })
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
