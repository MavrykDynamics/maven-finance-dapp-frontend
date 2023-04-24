import { useState } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { setBakerRequest } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

export const CouncilFormSetBaker = () => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    bakerHash: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    bakerHash: '',
  })

  const { bakerHash } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(setBakerRequest(bakerHash))
      setForm({
        bakerHash: '',
      })
      setFormInputStatus({
        bakerHash: '',
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
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT}>
            <Icon id="plus" />
            Set Baker
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
