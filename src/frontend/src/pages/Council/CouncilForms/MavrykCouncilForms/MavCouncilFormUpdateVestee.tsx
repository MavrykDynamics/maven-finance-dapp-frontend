import { useEffect, useMemo, useState } from 'react'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { UPDATE_VESTEE_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import type { InputStatusType } from '../../../../app/App.components/Input/Input.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../../app/App.components/Input/Input.constants'
import { MavrykCounsilDdForms } from '../../helpers/council.consts'
import { DEFAULT_VESTING_SUBS, VESTING_STORAGE_DATA_SUB } from 'providers/VestingProvider/helpers/vesting.consts'

// helpers
import { updateVestee } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

// types
import type { InputProps } from 'app/App.components/Input/newInput.type'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useVestingContext } from 'providers/VestingProvider/vesting.provider'

const INIT_FORM = {
  vesteeAddress: '',
  totalAllocated: '',
  cliffInMonths: '',
  vestingInMonths: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  vesteeAddress: INPUT_STATUS_DEFAULT,
  totalAllocated: INPUT_STATUS_DEFAULT,
  cliffInMonths: INPUT_STATUS_DEFAULT,
  vestingInMonths: INPUT_STATUS_DEFAULT,
}

export const MavCouncilFormUpdateVestee = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { vesteesAddresses, isLoading: isVesteesLoading, changeVestingSubscriptionsList } = useVestingContext()

  useEffect(() => {
    changeVestingSubscriptionsList({
      [VESTING_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeVestingSubscriptionsList(DEFAULT_VESTING_SUBS)
    }
  }, [])

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths } = form

  // update vestee council action
  const updateVesteeContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_VESTEE_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        if (!vesteesAddresses.includes(vesteeAddress)) {
          bug('Vestee does not exists')
          return null
        }

        return await updateVestee(
          vesteeAddress,
          Number(totalAllocated),
          Number(cliffInMonths),
          Number(vestingInMonths),
          councilAddress,
        )
      },
    }),
    [userAddress, councilAddress, vesteesAddresses, vesteeAddress, totalAllocated, cliffInMonths, vestingInMonths],
  )

  const { action: handleUpdateVestee } = useContractAction(updateVesteeContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleUpdateVestee()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormUpdateVestee', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const {
    vesteeAddressProps,
    vesteeAddressSettings,
    totalAllocatedProps,
    totalAllocatedSettings,
    cliffInMonthsProps,
    cliffInMonthsSettings,
    vestingInMonthsProps,
    vestingInMonthsSettings,
  } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)

    const vesteeAddressProps = {
      name: 'vesteeAddress',
      value: vesteeAddress,
      disabled: isVesteesLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validation
        validateAddress(e)
      },
      required: true,
    }

    const totalAllocatedProps: InputProps = {
      type: 'number',
      name: 'totalAllocated',
      value: totalAllocated,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validation
        const parsedTotalAllocated = Number(e.target.value)
        const isTotalAllocatedValid = parsedTotalAllocated > 0
        setFormInputStatus((prev) => ({
          ...prev,
          [e.target.name]: isTotalAllocatedValid ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    const cliffInMonthsProps: InputProps = {
      type: 'number',
      name: 'cliffInMonths',
      value: cliffInMonths,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validation
        const parsedCliffPeriod = Number(e.target.value)
        const parsedVestingPeriod = Number(vestingInMonths)
        const isCliffValueValid = parsedCliffPeriod >= 0 && parsedCliffPeriod < Number(vestingInMonths)
        const isVestingValueValid = parsedVestingPeriod > 0 && parsedVestingPeriod <= 120
        setFormInputStatus((prev) => ({
          ...prev,
          [e.target.name]:
            e.target.value !== '' && isVestingValueValid && isCliffValueValid
              ? INPUT_STATUS_SUCCESS
              : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    const vestingInMonthsProps: InputProps = {
      type: 'number',
      name: 'vestingInMonths',
      value: vestingInMonths,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validation
        const parsedVestingPeriod = Number(e.target.value)
        const parsedCliffPeriod = Number(cliffInMonths)
        const isVestingValueValid = parsedVestingPeriod > 0 && parsedVestingPeriod <= 120
        const isCliffValueValid = parsedCliffPeriod >= 0 && parsedCliffPeriod < parsedVestingPeriod
        setFormInputStatus((prev) => ({
          ...prev,
          [e.target.name]: isVestingValueValid ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          ...(prev.cliffInMonths === INPUT_STATUS_DEFAULT
            ? {}
            : {
                cliffInMonths:
                  cliffInMonths !== '' && isCliffValueValid && isVestingValueValid
                    ? INPUT_STATUS_SUCCESS
                    : INPUT_STATUS_ERROR,
              }),
        }))
      },
      required: true,
    }

    return {
      vesteeAddressProps,
      vesteeAddressSettings: {
        inputStatus: formInputStatus.vesteeAddress,
      },
      totalAllocatedProps,
      totalAllocatedSettings: {
        inputStatus: formInputStatus.totalAllocated,
      },
      cliffInMonthsProps,
      cliffInMonthsSettings: {
        inputStatus: formInputStatus.cliffInMonths,
      },
      vestingInMonthsProps,
      vestingInMonthsSettings: {
        inputStatus: formInputStatus.vestingInMonths,
      },
    }
  }, [
    cliffInMonths,
    formInputStatus.cliffInMonths,
    formInputStatus.totalAllocated,
    formInputStatus.vesteeAddress,
    formInputStatus.vestingInMonths,
    totalAllocated,
    vesteeAddress,
    vestingInMonths,
    isVesteesLoading,
  ])

  return (
    <CouncilFormStyled formName={MavrykCounsilDdForms.UPDATE_VESTEE}>
      <a
        className="info-link"
        href="https://docs.mavryk.finance/mavryk-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Update Vestee</H2Title>
        <div className="descr">
          Please enter valid function parameters for updating a vestee{' '}
          {isVesteesLoading ? <SpinnerCircleLoaderStyled /> : null}
        </div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="vestee-address">
          <label>Vestee Address</label>
          <Input inputProps={vesteeAddressProps} settings={vesteeAddressSettings} />
        </div>

        <div className="vestee-allocated-amount">
          <label>Total Allocated Amount</label>
          <Input inputProps={totalAllocatedProps} settings={totalAllocatedSettings} />
        </div>

        <div className="vestee-cliff-period">
          <label>
            New Cliff Period <small>(in months)</small>
          </label>
          <Input inputProps={cliffInMonthsProps} settings={cliffInMonthsSettings} />
        </div>

        <div className="vesting-period">
          <label>
            New Vesting Period <small>(in months)</small>
          </label>
          <Input inputProps={vestingInMonthsProps} settings={vestingInMonthsSettings} />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="update" />
            Update Vestee
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
