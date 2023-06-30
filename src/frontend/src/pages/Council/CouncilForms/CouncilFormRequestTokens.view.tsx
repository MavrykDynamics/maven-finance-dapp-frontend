import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { TokenType } from 'utils/TypesAndInterfaces/General'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DDItemId, DropDown, DropdownTruncateOption } from 'app/App.components/DropDown/NewDropdown'

// action
import { requestTokens } from '../Council.actions'

// types
import { InputProps } from 'app/App.components/Input/newInput.type'

// style
import { CouncilFormStyled } from './CouncilForm.style'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

const INIT_FORM = {
  treasuryAddress: '',
  tokenContractAddress: '',
  tokenName: '',
  tokenAmount: 0,
  tokenId: 0,
  purpose: '',
}

const tokenTypes = ['FA12', 'FA2', 'TEZ']

export const CouncilFormRequestTokens = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()

  const { tokensMetadata } = useTokensContext()

  const { isActionActive } = useSelector((state: State) => state.loading)

  const [form, setForm] = useState(INIT_FORM)

  const dropDownItems = useMemo(
    () =>
      tokenTypes.map((item, index) => ({
        content: <DropdownTruncateOption text={item} />,
        value: item.toLowerCase(),
        id: index,
      })),
    [],
  )

  type DropDownItemType = (typeof dropDownItems)[0]
  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  const [tokenDecimals, setTokenDecimals] = useState<number | null>(null)
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    treasuryAddress: '',
    tokenContractAddress: '',
    tokenName: '',
    tokenAmount: '',
    tokenId: '',
    purpose: '',
  })

  const { treasuryAddress, tokenContractAddress, tokenName, tokenAmount, tokenId, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const typeOfToken = chosenDdItem?.value as TokenType | undefined
    if (!typeOfToken || !tokenDecimals) return

    dispatch(
      requestTokens(
        treasuryAddress,
        tokenContractAddress,
        tokenName,
        +tokenAmount,
        typeOfToken,
        +tokenId,
        purpose,
        tokenDecimals,
      ),
    )

    setForm(INIT_FORM)
    setFormInputStatus({
      treasuryAddress: '',
      tokenContractAddress: '',
      tokenName: '',
      tokenAmount: '',
      tokenId: '',
      purpose: '',
    })
    setTokenDecimals(null)
    setChosenDdItem(undefined)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)
  const handleBlurTokenAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: tokenAddress, name } = e.target

    const token = getTokenDataByAddress({ tokenAddress, tokensMetadata })

    setFormInputStatus((prev) => {
      const isValidAddress = token ? 'success' : 'error'
      return { ...prev, [name]: isValidAddress }
    })

    if (token) setTokenDecimals(token.decimals)
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  const treasuryAddressProps = {
    name: 'treasuryAddress',
    value: treasuryAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const treasuryAddressSettings = {
    inputStatus: formInputStatus.treasuryAddress,
  }

  const tokenContractAddressProps = {
    name: 'tokenContractAddress',
    value: tokenContractAddress,
    onBlur: handleBlurTokenAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurTokenAddress(e)
    },
    required: true,
  }

  const tokenContractAddressSettings = {
    inputStatus: formInputStatus.tokenContractAddress,
  }

  const tokenNameProps = {
    name: 'tokenName',
    value: tokenName,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e, maxLength.requestTokenNameMaxLength),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e, maxLength.requestTokenNameMaxLength)
    },
    required: true,
  }

  const tokenNameSettings = {
    inputStatus: formInputStatus.tokenName,
  }

  const tokenAmountProps: InputProps = {
    type: 'number',
    name: 'tokenAmount',
    value: tokenAmount,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const tokenAmountSettings = {
    inputStatus: formInputStatus.tokenAmount,
  }

  const tokenIdProps: InputProps = {
    type: 'number',
    name: 'tokenId',
    value: tokenId,
    onBlur: (e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlur(e)
    },
    required: true,
  }

  const tokenIdSettings = {
    inputStatus: formInputStatus.tokenId,
  }
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

        <div>
          <label>Token Name</label>
          <Input inputProps={tokenNameProps} settings={tokenNameSettings} />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>

        <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <DropDown
            placeholder="Choose token type"
            activeItem={chosenDdItem}
            items={dropDownItems}
            clickItem={handleClickDropdownItem}
          />
        </div>

        <div>
          <label>Token ID</label>
          <Input inputProps={tokenIdProps} settings={tokenIdSettings} />
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
