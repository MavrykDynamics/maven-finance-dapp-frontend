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
import { setSingleContractAdmin } from 'providers/BreakGlassCouncilProvider/actions/breakGlassCouncil.actions'

// utils
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { SET_SINGLE_CONTRACT_ADMIN_ACTION } from 'providers/BreakGlassCouncilProvider/helpers/breakGlassCouncil.consts'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM = {
  newAdminAddress: '',
  targetContract: '',
}

export function FormSetSingleContractAdminView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    newAdminAddress: '',
    targetContract: '',
  })

  const { newAdminAddress, targetContract } = form

  const setSingleContractAdminAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!breakGlassAddress) {
      bug('Wrong breakGlass address')
      return null
    }

    return await setSingleContractAdmin(breakGlassAddress, newAdminAddress, targetContract)
  }, [userAddress, breakGlassAddress, newAdminAddress, targetContract, bug])

  const setSingleContractAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_SINGLE_CONTRACT_ADMIN_ACTION,
      actionFn: setSingleContractAdminAction,
    }),
    [setSingleContractAdminAction],
  )

  const { action: handleSetSingleContractAdmin } = useContractAction(setSingleContractAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetSingleContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus({
        newAdminAddress: '',
        targetContract: '',
      })
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const newAdminAddressProps = {
    name: 'newAdminAddress',
    value: newAdminAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const newAdminAddressSettings = {
    inputStatus: formInputStatus.newAdminAddress,
  }

  const targetContractProps = {
    name: 'targetContract',
    value: targetContract,
    onBlur: handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const targetContracSettings = {
    inputStatus: formInputStatus.targetContract,
  }

  return (
    <FormStyled>
      <h1>Set Single Contract Admin</h1>
      <p>Please enter valid function parameters for setting admin</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>New Admin Address</label>
          <Input className="margin-bottom-20" inputProps={newAdminAddressProps} settings={newAdminAddressSettings} />

          <label>Target Contract</label>
          <Input inputProps={targetContractProps} settings={targetContracSettings} />
        </div>

        <div className="btn-wrapper">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="profile" />
            Set Contract Admin
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
