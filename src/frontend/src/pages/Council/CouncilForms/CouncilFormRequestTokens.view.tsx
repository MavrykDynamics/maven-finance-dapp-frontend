import { useState, useMemo, useEffect } from 'react'

// consts
import { REQUEST_TOKENS_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { TREASURY_STORAGE_DATA_SUB, DEFAULT_TREASURY_SUBS } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../app/App.components/Input/Input.constants'

// types
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'
import type { TreasuryData } from 'providers/TreasuryProvider/helpers/treasury.types'
import type { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import type { InputProps } from 'app/App.components/Input/newInput.type'

// helpers
import { requestTokens } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { validateFormField } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { CouncilFormStyled } from './CouncilForm.style'
import Icon from '../../../app/App.components/Icon/Icon.view'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

const INIT_FORM = {
  treasuryAddress: '',
  tokenContractAddress: '',
  tokenAmount: 0,
  purpose: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  treasuryAddress: INPUT_STATUS_DEFAULT,
  tokenContractAddress: INPUT_STATUS_DEFAULT,
  tokenAmount: INPUT_STATUS_DEFAULT,
  purpose: INPUT_STATUS_DEFAULT,
}

// TODO: test inputs validation after db will be from api-v1
export const CouncilFormRequestTokens = (maxLength: CouncilMaxLength) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()
  const { changeTreasurySubscriptionsList, isLoading: isTreasuryLoading, treasuryMapper } = useTreasuryContext()

  useEffect(() => {
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
    }
  }, [])

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)
  const [selectedToken, setSelectedToken] = useState<TokenMetadataType | null>()
  const [selectedTreasury, setSelectedTreasury] = useState<TreasuryData | undefined>()
  const [tokenAmountInTreasury, setTokenAmountInTreasury] = useState<number>(0)

  const { treasuryAddress, tokenContractAddress, tokenAmount, purpose } = form

  // request tokens council action
  const requestTokensContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REQUEST_TOKENS_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        if (!selectedToken) {
          bug('Please enter correct token address')
          return null
        }

        return await requestTokens(
          treasuryAddress,
          tokenContractAddress,
          selectedToken.name,
          Number(tokenAmount),
          selectedToken.type,
          selectedToken.id,
          purpose,
          selectedToken.decimals,
          councilAddress,
        )
      },
    }),
    [userAddress, councilAddress, selectedToken, treasuryAddress, tokenContractAddress, tokenAmount, purpose],
  )

  const { action: handleRequestTokens } = useContractAction(requestTokensContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleRequestTokens()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (e) {
      console.error('CouncilFormRequestTokens', e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const validateText = validateFormField(setFormInputStatus)

  const {
    treasuryAddressProps,
    treasuryAddressSettings,
    tokenContractAddressProps,
    tokenContractAddressSettings,
    tokenAmountProps,
    tokenAmountSettings,
  } = useMemo(() => {
    const treasuryAddressProps = {
      name: 'treasuryAddress',
      value: treasuryAddress,
      disabled: isTreasuryLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate entered treasury address
        const { value: treasuryAddress, name } = e.target

        const treasuryByAddress = treasuryMapper[treasuryAddress]

        setFormInputStatus((prev) => ({
          ...prev,
          [name]: treasuryByAddress ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
        setSelectedTreasury(treasuryByAddress ? treasuryByAddress : undefined)

        // ---- revalidate deps inputs
        const tokenInTreasury = treasuryByAddress?.balances.find(
          ({ tokenAddress }) => selectedToken?.address === tokenAddress,
        )

        // revalidate token address from treasury, if was entered
        // if selected token is in treasury it's valid otherwise no
        if (formInputStatus.tokenContractAddress !== INPUT_STATUS_DEFAULT) {
          setFormInputStatus((prev) => ({
            ...prev,
            tokenContractAddress: tokenInTreasury ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          }))
        }

        // revalidate token amount of token, if was entered
        // if token selected & presented in treasury, and amount of token lessEq that amount of token in treasury it's valid otherwise no
        if (formInputStatus.tokenAmount !== INPUT_STATUS_DEFAULT) {
          const convetedTokenAmountInTreasury =
            tokenInTreasury && selectedToken
              ? convertNumberForClient({ number: tokenInTreasury.balance, grade: selectedToken.decimals })
              : 0
          const isTokenAmountValid = Number(tokenAmount) > 0 && Number(tokenAmount) <= convetedTokenAmountInTreasury

          setFormInputStatus((prev) => ({
            ...prev,
            tokenAmount: isTokenAmountValid ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          }))
        }
      },
      required: true,
    }

    const tokenContractAddressProps = {
      name: 'tokenContractAddress',
      value: tokenContractAddress,
      disabled: isTreasuryLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate token
        const { value: tokenAddress } = e.target
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })
        const tokenInTreasury = selectedTreasury?.balances.find(({ tokenAddress }) => token?.address === tokenAddress)
        const convetedTokenAmountInTreasury =
          tokenInTreasury && token
            ? convertNumberForClient({ number: tokenInTreasury.balance, grade: token.decimals })
            : 0

        setFormInputStatus((prev) => ({
          ...prev,
          tokenContractAddress: token && tokenInTreasury ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
        setSelectedToken(token)
        setTokenAmountInTreasury(convetedTokenAmountInTreasury)

        // revalidate token amount of token, if was entered
        if (formInputStatus.tokenAmount !== INPUT_STATUS_DEFAULT) {
          const isTokenAmountValid = Number(tokenAmount) > 0 && Number(tokenAmount) <= convetedTokenAmountInTreasury
          setFormInputStatus((prev) => ({
            ...prev,
            tokenAmount: isTokenAmountValid ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
          }))
        }
      },
      required: true,
    }

    const tokenAmountProps: InputProps = {
      type: 'number',
      name: 'tokenAmount',
      value: tokenAmount,
      disabled: isTreasuryLoading,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate value
        const { value: tokenAmount } = e.target
        const isTokenAmountValid = Number(tokenAmount) > 0 && Number(tokenAmount) <= tokenAmountInTreasury
        setFormInputStatus((prev) => ({
          ...prev,
          tokenAmount: isTokenAmountValid ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))
      },
      required: true,
    }

    return {
      treasuryAddressProps,
      treasuryAddressSettings: {
        inputStatus: formInputStatus.treasuryAddress,
      },
      tokenContractAddressProps,
      tokenContractAddressSettings: {
        inputStatus: formInputStatus.tokenContractAddress,
      },
      tokenAmountProps,
      tokenAmountSettings: {
        inputStatus: formInputStatus.tokenAmount,
      },
    }
  }, [
    formInputStatus.tokenAmount,
    formInputStatus.tokenContractAddress,
    formInputStatus.treasuryAddress,
    isTreasuryLoading,
    selectedToken,
    selectedTreasury?.balances,
    tokenAmount,
    tokenAmountInTreasury,
    tokenContractAddress,
    tokensMetadata,
    treasuryAddress,
    treasuryMapper,
  ])

  const tokenTypeProps = {
    name: 'tokenType',
    value: selectedToken?.type ?? 'No token selected',
    onChange: () => null,
    disabled: true,
  }

  const tokenNameProps = {
    name: 'tokenName',
    value: selectedToken?.name ?? 'No token selected',
    onChange: () => null,
    disabled: true,
  }
  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Request Tokens</h1>

      <p>
        {isTreasuryLoading ? (
          <>
            <div className="loading-label">
              Loading Treasuries <SpinnerCircleLoaderStyled />
            </div>
          </>
        ) : (
          'Please enter valid function parameters for requesting tokens'
        )}
      </p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input inputProps={treasuryAddressProps} settings={treasuryAddressSettings} />
        </div>

        <div>
          <label>Token Contract Address</label>
          <Input inputProps={tokenContractAddressProps} settings={tokenContractAddressSettings} />
        </div>

        <div>
          <label>Token Name</label>
          <Input inputProps={tokenNameProps} settings={tokenContractAddressSettings} />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>

        <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <Input inputProps={tokenTypeProps} settings={tokenContractAddressSettings} />
        </div>
      </div>

      <div className="textarea-group">
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
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
          <Icon id="request_token" />
          Request Tokens
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
