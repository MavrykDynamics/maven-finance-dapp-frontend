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
import { signAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { SIGN_BREAK_GLASS_ACTION } from 'providers/CouncilProvider/helpers/breakGlassCouncil.consts'

// consts
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const INIT_FORM = {
  breakGlassActionID: '',
}

export function FormSignActionView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    breakGlassActionID: '',
  })

  const { breakGlassActionID } = form

  // sign bg council action
  const signerActionFn = useCallback(
    async (id: number) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      if (!breakGlassAddress) {
        bug('Wrong breakGlass address')
        return null
      }

      return await signAction(breakGlassAddress, id)
    },
    [userAddress, breakGlassAddress, bug],
  )

  const signContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: SIGN_BREAK_GLASS_ACTION,
      actionFn: signerActionFn,
    }),
    [signerActionFn],
  )

  const { actionWithArgs: signActionHandler } = useContractAction(signContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await signActionHandler(+breakGlassActionID)

      setForm(INIT_FORM)
      setFormInputStatus({
        breakGlassActionID: '',
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

  const inputProps = {
    name: 'breakGlassActionID',
    value: breakGlassActionID,
    onBlur: handleBlur,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const inputSettings = {
    inputStatus: formInputStatus.breakGlassActionID,
  }

  return (
    <FormStyled>
      <h1>Sign Action</h1>
      <p>Please enter valid function parameters for sign action</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-fields input-size-primary">
          <label>Break Glass Action ID</label>

          <Input inputProps={inputProps} settings={inputSettings} />
        </div>

        <div className="btn-wrapper">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="sign" />
            Sign Action
          </NewButton>
        </div>
      </form>
    </FormStyled>
  )
}
