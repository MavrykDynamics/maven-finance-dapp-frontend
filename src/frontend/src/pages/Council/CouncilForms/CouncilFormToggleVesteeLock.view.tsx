import { useMemo, useState } from 'react'

// consts
import { TOGGLE_VESTEE_LOCK_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_DEFAULT, type InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { toggleVesteeLock } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilFormStyled } from './CouncilForm.style'
import Icon from '../../../app/App.components/Icon/Icon.view'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const INIT_FORM = {
  vesteeAddress: '',
}

const INTI_FORM_VALIDATION: Record<string, InputStatusType> = {
  vesteeAddress: INPUT_STATUS_DEFAULT,
}

export const CouncilFormToggleVesteeLock = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>(INTI_FORM_VALIDATION)

  const { vesteeAddress } = form

  // toggle vestee lock council action
  const toggleVesteeLockContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: TOGGLE_VESTEE_LOCK_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await toggleVesteeLock(vesteeAddress, councilAddress)
      },
    }),
    [vesteeAddress, userAddress, councilAddress],
  )

  const { action: handleToggleVesteeLock } = useContractAction(toggleVesteeLockContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleToggleVesteeLock()

      setForm(INIT_FORM)
      setFormInputStatus(INTI_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormToggleVesteeLock', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const vesteeAddressProps = {
    name: 'vesteeAddress',
    value: vesteeAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const vesteeAddressSettings = {
    inputStatus: formInputStatus.vesteeAddress,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Toggle Vestee Lock</h1>
      <p>Please enter valid function parameters for toggle vestee lock</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Vestee Address</label>
          <Input inputProps={vesteeAddressProps} settings={vesteeAddressSettings} />
        </div>
        <div className="button-aligment">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="lock" />
            Toggle Vestee Lock
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
