import React, { useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { FormStyled } from './BreakGlassCouncilForm.style'
import Icon from 'app/App.components/Icon/Icon.view'

// utils
import { setSingleContractAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { SET_SINGLE_CONTRACT_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM = {
  newAdminAddress: '',
  targetContract: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newAdminAddress: INPUT_STATUS_DEFAULT,
  targetContract: INPUT_STATUS_DEFAULT,
}

export function FormSetSingleContractAdminView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newAdminAddress, targetContract } = form

  const setSingleContractAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_SINGLE_CONTRACT_ADMIN_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await setSingleContractAdmin(breakGlassAddress, newAdminAddress, targetContract)
      },
    }),
    [breakGlassAddress, newAdminAddress, targetContract, userAddress],
  )

  const { action: handleSetSingleContractAdmin } = useContractAction(setSingleContractAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetSingleContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { newAdminAddressProps, newAdminAddressSettings, targetContractProps, targetContracSettings } = useMemo(() => {
    const validateText = validateFormField(setFormInputStatus)
    const validateAddress = validateFormAddress(setFormInputStatus)
    const newAdminAddressProps = {
      name: 'newAdminAddress',
      value: newAdminAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    const targetContractProps = {
      name: 'targetContract',
      value: targetContract,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        // TODO: should validate for kt address?
        validateText(e)
      },
      required: true,
    }

    return {
      newAdminAddressProps,
      newAdminAddressSettings: {
        inputStatus: formInputStatus.newAdminAddress,
      },
      targetContractProps,
      targetContracSettings: {
        inputStatus: formInputStatus.targetContract,
      },
    }
  }, [formInputStatus.newAdminAddress, formInputStatus.targetContract, newAdminAddress, targetContract])

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
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="profile" />
            Set Contract Admin
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
