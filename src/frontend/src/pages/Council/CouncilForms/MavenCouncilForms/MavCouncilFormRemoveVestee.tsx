import { useEffect, useMemo, useState } from 'react'

// helpers
import { validateFormAddress } from 'utils/validatorFunctions'
import { removeVesteeRequest } from 'providers/CouncilProvider/actions/mavenCouncil.actions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useVestingContext } from 'providers/VestingProvider/vesting.provider'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../../../app/App.components/Input/Input.constants'
import { REMOVE_VESTEE_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { MavenCouncilDdForms } from '../../helpers/council.consts'
import { DEFAULT_VESTING_SUBS, VESTING_STORAGE_DATA_SUB } from 'providers/VestingProvider/helpers/vesting.consts'

const INIT_FORM = {
  vesteeAddress: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  vesteeAddress: INPUT_STATUS_DEFAULT,
}

export const MavCouncilFormRemoveVestee = () => {
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

  const { vesteeAddress } = form

  // add council member council action
  const removeVesteeContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_VESTEE_ACTION,
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

        return await removeVesteeRequest(vesteeAddress, councilAddress)
      },
    }),
    [userAddress, councilAddress, vesteesAddresses, vesteeAddress],
  )

  const { action: handleRemoveVestee } = useContractAction(removeVesteeContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleRemoveVestee()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormRemoveVestee', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { vesteeAddressProps, vesteeAddressSettings } = useMemo(() => {
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

    return {
      vesteeAddressProps,
      vesteeAddressSettings: {
        inputStatus: formInputStatus.vesteeAddress,
      },
    }
  }, [formInputStatus.vesteeAddress, vesteeAddress, isVesteesLoading])

  return (
    <CouncilFormStyled $formName={MavenCouncilDdForms.REMOVE_VESTEE}>
      <a
        className="info-link"
        href="https://docs.mavryk.finance/mavryk-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Remove Vestee</H2Title>
        <div className="descr">
          Please enter valid function parameters for removing vestee{' '}
          {isVesteesLoading ? <SpinnerCircleLoaderStyled /> : null}
        </div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="vestee-address">
          <label>Vestee Address</label>
          <Input inputProps={vesteeAddressProps} settings={vesteeAddressSettings} />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="minus" />
            Remove Vestee
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
