import { useMemo, useState } from 'react'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { SET_BAKER_REQUEST_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { INPUT_STATUS_DEFAULT, InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { setBakerRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormField } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CouncilFormStyled } from './CouncilForm.style'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM = {
  bakerHash: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  bakerHash: INPUT_STATUS_DEFAULT,
}

export const CouncilFormSetBaker = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { bakerHash } = form

  // set baker council action
  const setBakerContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_BAKER_REQUEST_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await setBakerRequest(bakerHash, councilAddress)
      },
    }),
    [bakerHash, userAddress, councilAddress],
  )

  const { action: handleSetBaker } = useContractAction(setBakerContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSetBaker()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormSetBaker', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)

  const bakerHashProps = {
    name: 'bakerHash',
    value: bakerHash,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const bakerHashSettings = {
    inputStatus: formInputStatus.bakerHash,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Set Baker</h1>
      <p>Please enter valid function parameters for setting a baker</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Baker Hash</label>
          <Input inputProps={bakerHashProps} settings={bakerHashSettings} />
        </div>
        <div className="button-aligment">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="plus" />
            Set Baker
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
