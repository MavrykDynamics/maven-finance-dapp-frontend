import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { ACTION_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { requestTokenMint } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

const INIT_FORM = {
  treasuryAddress: '',
  tokenAmount: 0,
  purpose: '',
}

export const CouncilFormRequestTokenMint = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    treasuryAddress: '',
    tokenAmount: '',
    purpose: '',
  })

  const { treasuryAddress, tokenAmount, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(requestTokenMint(treasuryAddress, +tokenAmount, purpose))
      setForm(INIT_FORM)
      setFormInputStatus({
        treasuryAddress: '',
        tokenAmount: '',
        purpose: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const treasuryAddressProps = {
    name: 'treasuryAddress',
    value: treasuryAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const treasuryAddressSettings = {
    inputStatus: formInputStatus.treasuryAddress,
  }

  const tokenAmountProps = {
    name: 'tokenAmount',
    value: tokenAmount,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const tokenAmountSettings = {
    inputStatus: formInputStatus.tokenAmount,
  }

  const label = <span className="pinned-text">MVK</span>

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Request Token Mint</h1>
      <p>Please enter valid function parameters for requesting token mint</p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input inputProps={treasuryAddressProps} settings={treasuryAddressSettings} />
        </div>

        <div className="with-pinned-text">
          <label>Token Amount</label>
          <Input children={label} inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Request</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleChange(e)
          }}
          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, maxLength.requestPurposeMaxLength)}
          inputStatus={formInputStatus.purpose}
          textAreaMaxLimit={maxLength.requestPurposeMaxLength}
        />
      </div>
      <div className="btn-group">
        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="coin-loan" />
          Request Mint
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
