import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'

// action
import { addVestee } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'
import { State } from 'reducers'

const INIT_FORM = {
  vesteeAddress: '',
  totalAllocated: '',
  cliffInMonths: '',
  vestingInMonths: '',
}

export const CouncilFormAddVestee = () => {
  const dispatch = useDispatch()
  const { isActionActive } = useSelector((state: State) => state.loading)

  const [form, setForm] = useState(INIT_FORM)

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    vesteeAddress: '',
    totalAllocated: '',
    cliffInMonths: '',
    vestingInMonths: '',
  })

  const { vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await dispatch(addVestee(vesteeAddress, +totalAllocated, +cliffInMonths, +vestingInMonths))
      setForm(INIT_FORM)
      setFormInputStatus({
        vesteeAddress: '',
        totalAllocated: '',
        cliffInMonths: '',
        vestingInMonths: '',
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

  const totalAllocatedProps = {
    type: 'number',
    name: 'totalAllocated',
    value: totalAllocated,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const totalAllocatedSettings = {
    inputStatus: formInputStatus.totalAllocated,
  }

  const cliffInMonthsProps = {
    type: 'number',
    name: 'cliffInMonths',
    value: cliffInMonths,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const cliffInMonthsSettings = {
    inputStatus: formInputStatus.cliffInMonths,
  }

  const vestingInMonthsProps = {
    type: 'number',
    name: 'vestingInMonths',
    value: vestingInMonths,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const vestingInMonthsSettings = {
    inputStatus: formInputStatus.vestingInMonths,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Add Vestee</h1>
      <p>Please enter valid function parameters for adding a vestee</p>
      <div className="form-grid">
        <div>
          <label>Vestee Address</label>
          <Input inputProps={vesteeAddressProps} settings={vesteeAddressSettings} />
        </div>

        <div>
          <label>Total Allocated Amount</label>
          <Input inputProps={totalAllocatedProps} settings={totalAllocatedSettings} />
        </div>

        <div>
          <label>
            Cliff Period <small>(in months)</small>
          </label>
          <Input inputProps={cliffInMonthsProps} settings={cliffInMonthsSettings} />
        </div>

        <div>
          <label>
            Vesting Period <small>(in months)</small>
          </label>
          <Input inputProps={vestingInMonthsProps} settings={vestingInMonthsSettings} />
        </div>
      </div>
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
          <Icon id="plus" />
          Add Vestee
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
