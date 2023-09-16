import { useMemo, useState } from 'react'

// consts
import { SET_CONTRACT_BAKER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_DEFAULT, InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { setContractBakerRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CouncilFormStyled } from './CouncilForm.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const INIT_FORM = {
  targetContractAddress: '',
  keyHash: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  targetContractAddress: INPUT_STATUS_DEFAULT,
  keyHash: INPUT_STATUS_DEFAULT,
}

export const CouncilFormSetContractBaker = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { targetContractAddress, keyHash } = form

  // set contract baker council action
  const setContractBakerContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_CONTRACT_BAKER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await setContractBakerRequest(targetContractAddress, keyHash, councilAddress)
      },
    }),
    [targetContractAddress, keyHash, userAddress, councilAddress],
  )

  const { action: handleSetContractBaker } = useContractAction(setContractBakerContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSetContractBaker()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormSetContractBaker', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const targetContractAddressProps = {
    name: 'targetContractAddress',
    value: targetContractAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const targetContractAddressSettings = {
    inputStatus: formInputStatus.targetContractAddress,
  }

  const keyHashProps = {
    name: 'keyHash',
    value: keyHash,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlurAddress(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const keyHashSettings = {
    inputStatus: formInputStatus.keyHash,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Set Contract Baker</h1>
      <p>Please enter valid function parameters for setting a contract baker</p>
      <div className="form-grid">
        <div>
          <label>Target Contract Address</label>
          <Input inputProps={targetContractAddressProps} settings={targetContractAddressSettings} />
        </div>

        <div>
          <label>Key Hash</label>
          <Input inputProps={keyHashProps} settings={keyHashSettings} />
        </div>
      </div>
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
          <Icon id="plus" />
          Set Contract Baker
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
