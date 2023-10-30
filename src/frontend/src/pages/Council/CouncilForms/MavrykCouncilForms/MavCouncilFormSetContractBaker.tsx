import { useEffect, useMemo, useState } from 'react'

// consts
import { MavrykCounsilDdForms } from '../../helpers/council.consts'
import { SET_CONTRACT_BAKER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../../../app/App.components/Input/Input.constants'

// helpers
import { setContractBakerRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'
import {
  CONTRACT_STATUSES_ALL_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
} from 'providers/ContractStatuses/helpers/contractStatuses.consts'

const INIT_FORM = {
  targetContractAddress: '',
  keyHash: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  targetContractAddress: INPUT_STATUS_DEFAULT,
  keyHash: INPUT_STATUS_DEFAULT,
}

export const MavCouncilFormSetContractBaker = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    isLoading: isContractStatusesLoading,
    contractStatuses,
    changeContractStatusesSubscriptionsList,
  } = useContractStatusesContext()

  useEffect(() => {
    changeContractStatusesSubscriptionsList({
      [CONTRACT_STATUSES_ALL_SUB]: true,
    })

    return () => {
      changeContractStatusesSubscriptionsList(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)
    }
  }, [])

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { targetContractAddress, keyHash } = form

  // set contract baker council action
  const setContractBakerContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_CONTRACT_BAKER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await setContractBakerRequest(targetContractAddress, keyHash, councilAddress)
      },
    }),
    [targetContractAddress, keyHash, userAddress, councilAddress],
  )

  const { action: handleSetContractBaker } = useContractAction(setContractBakerContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSetContractBaker()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormSetContractBaker', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { targetContractAddressProps, targetContractAddressSettings, keyHashProps, keyHashSettings } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)

    const targetContractAddressProps = {
      name: 'targetContractAddress',
      value: targetContractAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // contract address should be one from contracts from contract status page
        setFormInputStatus((prev) => ({
          ...prev,
          [e.target.name]: contractStatuses.find(({ address }) => address === e.target.value)
            ? INPUT_STATUS_SUCCESS
            : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    const keyHashProps = {
      name: 'keyHash',
      value: keyHash,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    return {
      targetContractAddressProps,
      targetContractAddressSettings: {
        inputStatus: formInputStatus.targetContractAddress,
      },
      keyHashProps,
      keyHashSettings: {
        inputStatus: formInputStatus.keyHash,
      },
    }
  }, [formInputStatus.keyHash, formInputStatus.targetContractAddress, keyHash, targetContractAddress])

  return (
    <CouncilFormStyled formName={MavrykCounsilDdForms.SET_CONTRACT_BAKER}>
      <a
        className="info-link"
        href="https://docs.mavryk.finance/mavryk-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Set Contract Baker</H2Title>
        <div className="descr">
          Please enter valid function parameters for setting a contract baker{' '}
          {isContractStatusesLoading ? <SpinnerCircleLoaderStyled /> : null}
        </div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="contract-address">
          <label>Target Contract Address</label>
          <Input inputProps={targetContractAddressProps} settings={targetContractAddressSettings} />
        </div>

        <div className="baker-hash">
          <label>Baker Address</label>
          <Input inputProps={keyHashProps} settings={keyHashSettings} />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="plus" />
            Set Contract Baker
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
