import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { validateFormAddress } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
// import { toggleVesteeLock } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'
import { State } from 'reducers'

export const CouncilFormToggleVesteeLock = () => {
  const dispatch = useDispatch()
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [form, setForm] = useState({
    vesteeAddress: '',
  })

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    vesteeAddress: '',
  })

  const { vesteeAddress } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      // await dispatch(toggleVesteeLock(vesteeAddress))
      setForm({
        vesteeAddress: '',
      })
      setFormInputStatus({
        vesteeAddress: '',
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
