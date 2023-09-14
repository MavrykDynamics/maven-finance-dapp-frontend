import { useState, useMemo, useEffect } from 'react'

// consts
import { REQUEST_TOKENS_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { TREASURY_STORAGE_DATA_SUB, DEFAULT_TREASURY_SUBS } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../../app/App.components/Input/Input.constants'

// types
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { TreasuryData } from 'providers/TreasuryProvider/helpers/treasury.types'
import { TokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// helpers
import { requestTokens } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { CouncilFormStyled } from './CouncilForm.style'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// types
import { InputProps } from 'app/App.components/Input/newInput.type'

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
  tokenName: '',
  tokenAmount: 0,
  tokenId: 0,
  purpose: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  treasuryAddress: INPUT_STATUS_DEFAULT,
  tokenContractAddress: INPUT_STATUS_DEFAULT,
  tokenName: INPUT_STATUS_DEFAULT,
  tokenAmount: INPUT_STATUS_DEFAULT,
  tokenId: INPUT_STATUS_DEFAULT,
  purpose: INPUT_STATUS_DEFAULT,
}

// const tokenTypes = ['FA12', 'FA2', 'TEZ']

// TODO: finish when sam answer for this form
export const CouncilFormRequestTokens = (maxLength: CouncilMaxLength) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()

  const {
    changeTreasurySubscriptionsList,
    isLoading: isTreasuryLoading,
    treasuryAddresses,
    treasuryMapper,
  } = useTreasuryContext()

  useEffect(() => {
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
    }
  }, [])

  console.log({ isTreasuryLoading, treasuryAddresses, treasuryMapper })

  // const dropDownItems = useMemo(
  //   () =>
  //     tokenTypes.map((item, index) => ({
  //       content: <DropdownTruncateOption text={item} />,
  //       value: item.toLowerCase(),
  //       id: index,
  //     })),
  //   [],
  // )

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)
  const [selectedToken, setSelectedToken] = useState<TokenMetadataType | undefined>()
  const [selectedTreasury, setSelectedTreasury] = useState<TreasuryData | undefined>()
  const [tokenAmountInTreasury, setTokenAmountInTreasury] = useState<number | undefined>()

  const { treasuryAddress, tokenContractAddress, tokenName, tokenAmount, tokenId, purpose } = form

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

  // type DropDownItemType = (typeof dropDownItems)[0]
  // const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  // const [tokenDecimals, setTokenDecimals] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleRequestTokens()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
      // setTokenDecimals(null)
      // setChosenDdItem(undefined)
    } catch (e) {
      console.error('CouncilFormRequestTokens', e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)

  // const handleClickDropdownItem = (itemId: DDItemId) => {
  //   const foundItem = dropDownItems.find((item) => item.id === itemId)

  //   if (!foundItem) return
  //   setChosenDdItem(foundItem)
  // }

  // revalidate token and token amount on treasury change
  useEffect(() => {
    if (formInputStatus['tokenAmount'] !== INPUT_STATUS_DEFAULT) {
      setFormInputStatus((prev) => ({
        ...prev,
        tokenAmount:
          Number(tokenAmount) > 0 && Number(tokenAmount) <= Number(tokenAmountInTreasury)
            ? INPUT_STATUS_SUCCESS
            : INPUT_STATUS_ERROR,
      }))
    }

    if (formInputStatus['tokenContractAddress'] !== INPUT_STATUS_DEFAULT) {
      const token = getTokenDataByAddress({ tokenAddress: tokenContractAddress, tokensMetadata })
      const tokenInTreasury = selectedTreasury?.balances.find(
        ({ tokenAddress }) => tokenContractAddress === tokenAddress,
      )
      setFormInputStatus((prev) => ({
        ...prev,
        tokenContractAddress: token && tokenInTreasury ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      }))
    }
  }, [selectedTreasury])

  // revalidate token amount on token change
  useEffect(() => {
    if (formInputStatus['tokenAmount'] !== INPUT_STATUS_DEFAULT) {
      setFormInputStatus((prev) => ({
        ...prev,
        tokenAmount:
          Number(tokenAmount) > 0 && Number(tokenAmount) <= Number(tokenAmountInTreasury)
            ? INPUT_STATUS_SUCCESS
            : INPUT_STATUS_ERROR,
      }))
    }
  }, [tokenAmountInTreasury])

  const treasuryAddressProps = {
    name: 'treasuryAddress',
    value: treasuryAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)

      const { value: treasuryAddress, name } = e.target

      const treasuryByAddress = treasuryMapper[treasuryAddress]

      setFormInputStatus((prev) => ({
        ...prev,
        [name]: treasuryByAddress ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      }))

      setSelectedTreasury(treasuryByAddress ? treasuryByAddress : undefined)
    },
    required: true,
  }

  const treasuryAddressSettings = {
    inputStatus: formInputStatus.treasuryAddress,
  }

  const tokenContractAddressProps = {
    name: 'tokenContractAddress',
    value: tokenContractAddress,
    disabled: !selectedTreasury,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)

      const { value: tokenAddress } = e.target
      const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })
      const tokenInTreasury = selectedTreasury?.balances.find(({ tokenAddress }) => token?.address === tokenAddress)

      setFormInputStatus((prev) => ({
        ...prev,
        tokenContractAddress: token && tokenInTreasury ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR,
      }))

      setSelectedToken(token ? token : undefined)
      setTokenAmountInTreasury(
        tokenInTreasury && token
          ? convertNumberForClient({ number: tokenInTreasury.balance, grade: token.decimals })
          : undefined,
      )
    },
    required: true,
  }

  const tokenContractAddressSettings = {
    inputStatus: formInputStatus.tokenContractAddress,
  }

  // const tokenNameProps = {
  //   name: 'tokenName',
  //   value: tokenName,
  //   onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.requestTokenNameMaxLength),
  //   onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
  //     handleChange(e)
  //     handleBlur(e, maxLength.requestTokenNameMaxLength)
  //   },
  //   required: true,
  // }

  // const tokenNameSettings = {
  //   inputStatus: formInputStatus.tokenName,
  // }

  const tokenAmountProps: InputProps = {
    type: 'number',
    name: 'tokenAmount',
    value: tokenAmount,
    disabled: !tokenAmountInTreasury,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      const { value: tokenAmount } = e.target

      setFormInputStatus((prev) => ({
        ...prev,
        tokenAmount:
          Number(tokenAmount) > 0 && Number(tokenAmount) <= Number(tokenAmountInTreasury)
            ? INPUT_STATUS_SUCCESS
            : INPUT_STATUS_ERROR,
      }))
    },
    required: true,
  }

  const tokenAmountSettings = {
    inputStatus: formInputStatus.tokenAmount,
  }

  // const tokenIdProps: InputProps = {
  //   type: 'number',
  //   name: 'tokenId',
  //   value: tokenId,
  //   onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
  //   onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
  //     handleChange(e)
  //     handleBlur(e)
  //   },
  //   required: true,
  // }

  // const tokenIdSettings = {
  //   inputStatus: formInputStatus.tokenId,
  // }
  // TODO: need to add a sequence of fields
  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Request Tokens</h1>
      <p>Please enter valid function parameters for requesting tokens</p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input inputProps={treasuryAddressProps} settings={treasuryAddressSettings} />
        </div>

        <div>
          <label>Token Contract Address</label>
          <Input inputProps={tokenContractAddressProps} settings={tokenContractAddressSettings} />
        </div>

        {/* <div>
          <label>Token Name</label>
          <Input inputProps={tokenNameProps} settings={tokenNameSettings} />
        </div> */}

        <div>
          <label>Token Amount to Transfer</label>
          <Input inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>

        {/* <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <DropDown
            placeholder="Choose token type"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div> */}

        {/* <div>
          <label>Token ID</label>
          <Input inputProps={tokenIdProps} settings={tokenIdSettings} />
        </div> */}
      </div>
      <div className="textarea-group">
        <label>Purpose for Request</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleChange(e)
            handleBlur(e, maxLength.requestPurposeMaxLength)
          }}
          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, maxLength.requestPurposeMaxLength)}
          inputStatus={formInputStatus.purpose}
          textAreaMaxLimit={maxLength.requestPurposeMaxLength}
        />
      </div>
      <div className="btn-group">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
          <Icon id="request_token" />
          Request Tokens
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
