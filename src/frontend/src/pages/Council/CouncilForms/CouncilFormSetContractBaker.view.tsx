import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { setContractBakerRequest } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

const INIT_FORM = {
  targetContractAddress: '',
  keyHash: '',
}

export const CouncilFormSetContractBaker = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    targetContractAddress: '',
    keyHash: '',
  })

  const { targetContractAddress, keyHash } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(setContractBakerRequest(targetContractAddress, keyHash))
      setForm(INIT_FORM)
      setFormInputStatus({
        targetContractAddress: '',
        keyHash: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
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
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
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
        <NewButton kind={BUTTON_PRIMARY} type={SUBMIT}>
          <Icon id="plus" />
          Set Contract Baker
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
