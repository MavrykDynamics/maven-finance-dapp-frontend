import { useEffect, useMemo, useState } from 'react'

// consts
import { MavrykCounsilDdForms } from '../../helpers/council.consts'
import { REQUEST_TOKENS_MINT_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { DAPP_MVN_SMVN_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'
import { DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_DATA_SUB } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import type { InputStatusType } from '../../../../app/App.components/Input/Input.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../../app/App.components/Input/Input.constants'

// helpers
import { requestTokenMint } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormField } from 'utils/validatorFunctions'

// types
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { TextArea } from '../../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

const INIT_FORM = {
  treasuryAddress: '',
  tokenAmount: 0,
  purpose: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  treasuryAddress: INPUT_STATUS_DEFAULT,
  tokenAmount: INPUT_STATUS_DEFAULT,
  purpose: INPUT_STATUS_DEFAULT,
}

// TODO: test inputs validation after db will be from api-v1
export const MavCouncilFormRequestTokenMint = (maxLength: CouncilMaxLength) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { totalSupply, isLoading: isDoormanLoading, changeStakingSubscriptionsList } = useDoormanContext()
  const { changeTreasurySubscriptionsList, isLoading: isTreasuryLoading, treasuryMapper } = useTreasuryContext()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVN_SMVN_STATS_SUB]: true,
    })
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
    }
  }, [])

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { treasuryAddress, tokenAmount, purpose } = form

  // request tokens council action
  const requestTokensMintContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REQUEST_TOKENS_MINT_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await requestTokenMint(treasuryAddress, userAddress, Number(tokenAmount), purpose, councilAddress)
      },
    }),
    [userAddress, councilAddress, treasuryAddress, tokenAmount, purpose],
  )

  const { action: handleRequestTokensMint } = useContractAction(requestTokensMintContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleRequestTokensMint()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormRequestTokenMint', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive ||
    Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS) ||
    isTreasuryLoading ||
    isDoormanLoading

  const { treasuryAddressProps, treasuryAddressSettings, tokenAmountProps, tokenAmountSettings } = useMemo(() => {
    const treasuryAddressProps = {
      name: 'treasuryAddress',
      value: treasuryAddress,
      disabled: isTreasuryLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate treasury address
        setFormInputStatus((prev) => ({
          ...prev,
          treasuryAddress: treasuryMapper[e.target.value] ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    const tokenAmountProps = {
      name: 'tokenAmount',
      value: tokenAmount,
      disabled: isDoormanLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate mvk amount
        const amountInNumber = Number(e.target.value)
        setFormInputStatus((prev) => ({
          ...prev,
          tokenAmount: amountInNumber >= 1 && amountInNumber <= totalSupply ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    return {
      treasuryAddressProps,
      treasuryAddressSettings: {
        inputStatus: formInputStatus.treasuryAddress,
      },
      tokenAmountProps,
      tokenAmountSettings: {
        inputStatus: formInputStatus.tokenAmount,
      },
    }
  }, [
    formInputStatus.tokenAmount,
    formInputStatus.treasuryAddress,
    isDoormanLoading,
    isTreasuryLoading,
    tokenAmount,
    totalSupply,
    treasuryAddress,
    treasuryMapper,
  ])

  const validateText = validateFormField(setFormInputStatus)

  return (
    <CouncilFormStyled formName={MavrykCounsilDdForms.REQUEST_TOKEN_MINT}>
      <a
        className="info-link"
        href="https://docs.mavryk.finance/mavryk-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Request Token Mint</H2Title>
        <div className="descr">
          Please enter valid function parameters for requesting token mint{' '}
          {isTreasuryLoading || isDoormanLoading ? <SpinnerCircleLoaderStyled /> : null}
        </div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="contract-address">
          <label>Treasury Address</label>
          <Input inputProps={treasuryAddressProps} settings={treasuryAddressSettings} />
        </div>

        <div className="token-amount">
          <label>Token Amount</label>
          <Input className="transparent-child-wrap" inputProps={tokenAmountProps} settings={tokenAmountSettings}>
            <div className="pinned-child">MVK</div>
          </Input>
        </div>

        <div className="purpose">
          <label>Purpose for Request</label>
          <TextArea
            required
            value={purpose}
            name="purpose"
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              handleChange(e)
              validateText(e, maxLength.requestPurposeMaxLength)
            }}
            inputStatus={formInputStatus.purpose}
            textAreaMaxLimit={maxLength.requestPurposeMaxLength}
          />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="loans" />
            Request Mint
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
