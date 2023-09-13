import { useMemo, useState } from 'react'

// helpers
import { addVestee } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// consts
import { ADD_VESTEE_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilFormStyled } from './CouncilForm.style'
import Icon from '../../../app/App.components/Icon/Icon.view'

// types
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import type { InputProps } from 'app/App.components/Input/newInput.type'

// style
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

const INIT_FORM = {
  vesteeAddress: '',
  totalAllocated: '',
  cliffInMonths: '',
  vestingInMonths: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  vesteeAddress: '',
  totalAllocated: '',
  cliffInMonths: '',
  vestingInMonths: '',
}

export const CouncilFormAddVestee = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths } = form

  // add vestee council action
  const addVesteeCouncilContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: ADD_VESTEE_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await addVestee(
          vesteeAddress,
          Number(totalAllocated),
          Number(cliffInMonths),
          Number(vestingInMonths),
          councilAddress,
        )
      },
    }),
    [vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths, userAddress, councilAddress],
  )

  const { action: handleAddVesteeCouncil } = useContractAction(addVesteeCouncilContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleAddVesteeCouncil()
      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormAddVestee', error)
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

  const totalAllocatedProps: InputProps = {
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

  const cliffInMonthsProps: InputProps = {
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

  const vestingInMonthsProps: InputProps = {
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
