import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import { Input } from '../../app/App.components/Input/Input.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../app/App.components/Button/Button.controller'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.constants'

// actions
import {
  suspendSatellite,
  unsuspendSatellite,
  banSatellite,
  unbanSatellite,
  removeOracles,
  removeOracleInAggregator,
  addOracleToAggregator,
  restoreSatellite,
  setAggregatorMaintainer,
  updateAggregatorStatus,
} from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

// helpers
import { validateFormField, validateFormAddress } from 'utils/validatorFunctions'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

const handleComparingValue = (value: string) => {
  return value.replaceAll(' ', '').toLowerCase()
}

const compareValues = (a: string, b: string) => {
  return handleComparingValue(a) === handleComparingValue(b)
}

type MaxLength = {
  purposeMaxLength: number
  aggregatorNameMaxLength: number
}

type Props = {
  variant: string
  maxLength: MaxLength
}

type InputStatus = Record<string, InputStatusType>
type InputValue = {
  oracleAddress: string
  satelliteAddress: string
  purpose: string
}

const initialData = {
  oracleAddress: '',
  satelliteAddress: '',
  purpose: '',
} as InputValue & InputStatus

const CONTENT_FORM = new Map<string, Record<string, string>>([
  [
    'Suspend Satellite',
    {
      title: 'Suspend Satellite',
      btnText: 'Suspend Satellite',
      btnIcon: 'minus',
    },
  ],
  [
    'Unsuspend Satellite',
    {
      title: 'Unsuspend Satellite',
      btnText: 'Unsuspend Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'Ban Satellite',
    {
      title: 'Ban Satellite',
      btnText: 'Ban Satellite',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'Unban Satellite',
    {
      title: 'Unban Satellite',
      btnText: 'Unban Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'Remove Oracles',
    {
      title: 'Remove all Oracles from Satellite',
      btnText: 'Remove Oracles',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'Remove from Aggregator',
    {
      title: 'Remove from Aggregator',
      btnText: 'Remove from Aggregator',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'Add to Aggregator',
    {
      title: 'Add Oracle to Aggregator',
      btnText: 'Add to Aggregator',
      btnIcon: 'plus',
    },
  ],
  [
    'Restore Satellite',
    {
      title: 'Restore Satellite',
      btnText: 'Restore Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'Set Aggregator Maintainer',
    {
      title: 'Set Aggregator Maintainer',
      btnText: 'Set Aggregator Maintainer',
      btnIcon: 'plus',
    },
  ],
  [
    'Update Aggregator Status',
    {
      title: 'Update Aggregator Status',
      btnText: 'Update Aggregator Status',
      btnIcon: 'plus',
    },
  ],
])

export const SatelliteGovernanceForm = ({ variant, maxLength }: Props) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState<InputValue>(initialData)
  const [formInputStatus, setFormInputStatus] = useState<InputStatus>(initialData)

  const { oracleAddress, satelliteAddress, purpose } = form

  const content = CONTENT_FORM.get(variant)

  const isFieldOracleAddress =
    compareValues(variant, 'removeFromAggregator') ||
    compareValues(variant, 'addToAggregator') ||
    compareValues(variant, 'setAggregatorMaintainer') ||
    compareValues(variant, 'updateAggregatorStatus')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      switch (handleComparingValue(variant)) {
        case handleComparingValue('suspendSatellite'):
          await dispatch(suspendSatellite(satelliteAddress, purpose))
          break
        case handleComparingValue('unsuspendSatellite'):
          await dispatch(unsuspendSatellite(satelliteAddress, purpose))
          break
        case handleComparingValue('banSatellite'):
          await dispatch(banSatellite(satelliteAddress, purpose))
          break
        case handleComparingValue('unbanSatellite'):
          await dispatch(unbanSatellite(satelliteAddress, purpose))
          break
        case handleComparingValue('removeOracles'):
          await dispatch(removeOracles(satelliteAddress, purpose))
          break
        case handleComparingValue('restoreSatellite'):
          await dispatch(restoreSatellite(satelliteAddress, purpose))
          break
        case handleComparingValue('removeFromAggregator'):
          await dispatch(removeOracleInAggregator(oracleAddress, satelliteAddress, purpose))
          break
        case handleComparingValue('addToAggregator'):
          await dispatch(addOracleToAggregator(oracleAddress, satelliteAddress, purpose))
          break
        case handleComparingValue('setAggregatorMaintainer'):
          await dispatch(setAggregatorMaintainer(oracleAddress, satelliteAddress, purpose))
          break
        case handleComparingValue('updateAggregatorStatus'):
          await dispatch(updateAggregatorStatus(oracleAddress, satelliteAddress, purpose))
          break
      }

      setForm({
        oracleAddress: '',
        satelliteAddress: '',
        purpose: '',
      })
      setFormInputStatus({
        oracleAddress: '',
        satelliteAddress: '',
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

  useEffect(() => {
    setForm(initialData)
    setFormInputStatus(initialData)
  }, [variant])

  if (!variant) return null

  return (
    <AvailableActionsStyle>
      <form onSubmit={handleSubmit} className="inputs-block">
        <a
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <CustomTooltip iconId="question" />
        </a>
        <div>
          <h1>{content?.title}</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>
                {compareValues(variant, 'setAggregatorMaintainer')
                  ? 'Maintainer Address'
                  : compareValues(variant, 'updateAggregatorStatus')
                  ? 'Status'
                  : 'Satellite Address'}
              </label>
              <Input
                value={satelliteAddress}
                name="satelliteAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlurAddress(e)
                }}
                onBlur={handleBlurAddress}
                inputStatus={formInputStatus.satelliteAddress}
              />
            </div>
            {isFieldOracleAddress ? (
              <div className="satellite-address">
                <label>
                  {compareValues(variant, 'setAggregatorMaintainer') || compareValues(variant, 'updateAggregatorStatus')
                    ? 'Aggregator Address'
                    : 'Oracle Address'}
                </label>
                <Input
                  value={oracleAddress}
                  name="oracleAddress"
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    handleBlurAddress(e)
                  }}
                  onBlur={handleBlurAddress}
                  inputStatus={formInputStatus.oracleAddress}
                />
              </div>
            ) : (
              <div />
            )}
          </fieldset>
          <div>
            <label>Purpose</label>
            <TextArea
              value={purpose}
              name="purpose"
              required
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                handleChange(e)
              }}
              onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, maxLength.purposeMaxLength)}
              inputStatus={formInputStatus.purpose}
              textAreaMaxLimit={maxLength.purposeMaxLength}
            />
          </div>
        </div>
        <div className="suspend-satellite-group">
          <Button
            className={`${variant} fill`}
            icon={content?.btnIcon || ''}
            kind="actionPrimary"
            text={content?.btnText || ''}
            type="submit"
          />
        </div>
      </form>
    </AvailableActionsStyle>
  )
}
