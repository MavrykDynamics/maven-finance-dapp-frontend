import React, { useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { BgCounsilDdForms } from '../helpers/council.consts'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilFormHeaderStyled, CouncilFormStyled } from './BreakGlassCouncilForm.style'
import Icon from 'app/App.components/Icon/Icon.view'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { SIGN_BREAK_GLASS_COUNCIL_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'

// utils
import { signBreakGlassAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormField } from 'utils/validatorFunctions'

const INIT_FORM = {
  breakGlassActionID: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  breakGlassActionID: INPUT_STATUS_DEFAULT,
}

export function FormSignActionView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { breakGlassActionID } = form

  // sign bg council action
  const signContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: SIGN_BREAK_GLASS_COUNCIL_ACTION,
      actionFn: async (id: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await signBreakGlassAction(id, breakGlassAddress)
      },
    }),
    [breakGlassAddress, userAddress],
  )

  const { actionWithArgs: signActionHandler } = useContractAction(signContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await signActionHandler(+breakGlassActionID)

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

  const { actionIdProps, actionIdSettings } = useMemo(() => {
    const validateText = validateFormField(setFormInputStatus)

    const actionIdProps = {
      name: 'breakGlassActionID',
      value: breakGlassActionID,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateText(e)
      },
      required: true,
    }

    return {
      actionIdProps,
      actionIdSettings: {
        inputStatus: formInputStatus.breakGlassActionID,
      },
    }
  }, [breakGlassActionID, formInputStatus.breakGlassActionID])

  return (
    <CouncilFormStyled formName={BgCounsilDdForms.SIGN_ACTION}>
      <CouncilFormHeaderStyled>
        <H2Title>Sign Action</H2Title>
        <div className="descr">Please enter valid function parameters for sign action</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="action-id">
          <label>Break Glass Action ID</label>

          <Input inputProps={actionIdProps} settings={actionIdSettings} />
        </div>

        <div className="submit-form right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="sign" />
            Sign Action
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
