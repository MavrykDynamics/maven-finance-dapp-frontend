import { useMemo, useState } from 'react'

// consts
import { MavenCouncilDdForms } from '../../helpers/council.consts'
import { TRANSFER_TOKENS_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import type { InputStatusType } from '../../../../app/App.components/Input/Input.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
} from '../../../../app/App.components/Input/Input.constants'

// types
import type { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import type { InputProps } from 'app/App.components/Input/newInput.type'
import type { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// helpers
import { transferTokens } from 'providers/CouncilProvider/actions/mavenCouncil.actions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import { TextArea } from '../../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'

const INIT_FORM = {
  receiverAddress: '',
  tokenContractAddress: '',
  tokenAmount: 0,
  purpose: '',
}

const INIT_FOR_VALIDATION: Record<string, InputStatusType> = {
  receiverAddress: INPUT_STATUS_DEFAULT,
  tokenContractAddress: INPUT_STATUS_DEFAULT,
  tokenAmount: INPUT_STATUS_DEFAULT,
  purpose: INPUT_STATUS_DEFAULT,
}

// TODO: test inputs validation after db will be from api-v1
export const MavCouncilFormTransferTokens = (maxLength: CouncilMaxLength) => {
  const { userAddress, userTokensBalances } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FOR_VALIDATION)
  const [selectedToken, setSelectedToken] = useState<TokenMetadataType | null>()

  const { receiverAddress, tokenContractAddress, tokenAmount, purpose } = form

  // transfer tokens council action
  const transferTokensContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: TRANSFER_TOKENS_ACTION,
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

        return await transferTokens(
          receiverAddress,
          tokenContractAddress,
          Number(tokenAmount),
          selectedToken,
          purpose,
          councilAddress,
        )
      },
    }),
    [userAddress, councilAddress, selectedToken, receiverAddress, tokenContractAddress, tokenAmount, purpose],
  )

  const { action: handleTransferTokens } = useContractAction(transferTokensContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleTransferTokens()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FOR_VALIDATION)
    } catch (e) {
      console.error('CouncilFormTransferTokens', e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const {
    validateText,
    receiverAddressProps,
    receiverAddressSettings,
    tokenContractAddressProps,
    tokenContractAddressSettings,
    tokenAmountProps,
    tokenAmountSettings,
  } = useMemo(() => {
    const validateText = validateFormField(setFormInputStatus)
    const validateAddress = validateFormAddress(setFormInputStatus)
    const validateTokenAmount = (newTokenAmount: number, newTokenAddress?: string) => {
      const userTokenBalance = getUserTokenBalanceByAddress({
        userTokensBalances,
        tokenAddress: newTokenAddress ?? tokenContractAddress,
      })
      setFormInputStatus((prev) => ({
        ...prev,
        tokenAmount:
          newTokenAmount > 0 && newTokenAmount <= userTokenBalance ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      }))
    }

    const receiverAddressProps: InputProps = {
      name: 'receiverAddress',
      value: receiverAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate value
        const { value: receiverAddress, name } = e.target
        if (receiverAddress === userAddress) {
          setFormInputStatus((prev) => ({ ...prev, [name]: INPUT_STATUS_ERROR }))
        } else {
          validateAddress(e)
        }
      },
      required: true,
    }

    const tokenContractAddressProps: InputProps = {
      name: 'tokenContractAddress',
      value: tokenContractAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate value
        const { value: tokenAddress, name } = e.target
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })

        setFormInputStatus((prev) => ({
          ...prev,
          [name]: token ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
        }))

        setSelectedToken(token)

        // revalidate token amount after token change if it's was entered
        if (formInputStatus.tokenAmount !== INPUT_STATUS_DEFAULT) {
          validateTokenAmount(Number(tokenAmount), tokenAddress)
        }
      },
      required: true,
    }

    const tokenAmountProps: InputProps = {
      type: 'number',
      name: 'tokenAmount',
      value: tokenAmount,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)

        // validate value
        validateTokenAmount(Number(e.target.value))
      },
      required: true,
    }

    return {
      validateText,
      receiverAddressProps,
      receiverAddressSettings: {
        inputStatus: formInputStatus.receiverAddress,
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
    formInputStatus.receiverAddress,
    formInputStatus.tokenAmount,
    formInputStatus.tokenContractAddress,
    receiverAddress,
    tokenAmount,
    tokenContractAddress,
    tokensMetadata,
    userAddress,
    userTokensBalances,
  ])

  const tokenTypeProps = {
    name: 'tokenType',
    value: selectedToken?.type.toUpperCase() ?? 'No token selected',
    onChange: () => null,
    disabled: true,
  }

  const tokenNameProps = {
    name: 'tokenName',
    value: selectedToken?.symbol ?? 'No token selected',
    onChange: () => null,
    disabled: true,
  }

  return (
    <CouncilFormStyled $formName={MavenCouncilDdForms.TRANSFER_TOKENS}>
      <a
        className="info-link"
        href="https://docs.mavenfinance.io/maven-finance/council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Transfer Tokens</H2Title>
        <div className="descr">Please enter valid function parameters for transferring tokens</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="receiver-address">
          <label>Receiver’s Address</label>
          <Input inputProps={receiverAddressProps} settings={receiverAddressSettings} />
        </div>

        <div />

        <div className="contract-address">
          <label>Token Contract Address</label>
          <Input inputProps={tokenContractAddressProps} settings={tokenContractAddressSettings} />
        </div>

        <div className="token-amount">
          <label>Token Amount to Transfer</label>
          <Input inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>

        <div className="token-type">
          <label>Token Type (FA12, FA2, MAV)</label>
          <Input inputProps={tokenTypeProps} settings={tokenContractAddressSettings} />
        </div>

        <div className="token-name">
          <label>Token Name</label>
          <Input inputProps={tokenNameProps} settings={tokenContractAddressSettings} />
        </div>

        <div className="purpose">
          <label>Purpose for Transfer</label>
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
            <Icon id="transfer_tokens" />
            Transfer Tokens
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
