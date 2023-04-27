import { useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import NewButton from 'app/App.components/Button/NewButton'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.constants'

// actions
import { registerAggregator } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

type MaxLength = {
  purposeMaxLength: number
  aggregatorNameMaxLength: number
}

type Props = {
  maxLength: MaxLength
  isActionActive: boolean
}

export const RegisterAggregatorForm = ({ maxLength, isActionActive }: Props) => {
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    aggregatorPair: '',
    aggregatorAddress: '',
  })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    aggregatorPair: '',
    aggregatorAddress: '',
  })

  const { aggregatorPair, aggregatorAddress } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      dispatch(registerAggregator(aggregatorPair, aggregatorAddress))
      setForm({
        aggregatorPair: '',
        aggregatorAddress: '',
      })
      setFormInputStatus({
        aggregatorPair: '',
        aggregatorAddress: '',
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

  return (
    <AvailableActionsStyle>
      <form onSubmit={handleSubmit} className="inputs-block">
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <div>
          <h1>Register Aggregator</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>Aggregator Pair</label>
              <Input
                value={aggregatorPair}
                name="aggregatorPair"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e, maxLength.aggregatorNameMaxLength)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.aggregatorNameMaxLength)}
                inputStatus={formInputStatus.aggregatorPair}
              />
            </div>
            <div className="satellite-address">
              <label>Aggregator Address</label>
              <Input
                value={aggregatorAddress}
                name="aggregatorAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlurAddress(e)
                }}
                onBlur={handleBlurAddress}
                inputStatus={formInputStatus.aggregatorAddress}
              />
            </div>
          </fieldset>
        </div>

        <div className="suspend-satellite-group">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isActionActive} type={SUBMIT}>
            <Icon id="plus" /> Register Aggregator
          </NewButton>
        </div>
      </form>
    </AvailableActionsStyle>
  )
}
