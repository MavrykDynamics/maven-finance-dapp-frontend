import { useState, useMemo, useCallback } from 'react'
import { useDispatch } from 'react-redux'

// type
import type { InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

// helpers
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'
import { ACTION_PRIMARY, SUBMIT } from 'app/App.components/Button/Button.constants'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'

// action
import { transferTokens } from '../Council.actions'

// style
import { CouncilFormStyled } from './CouncilForm.style'

const INIT_FORM = {
  receiverAddress: '',
  tokenContractAddress: '',
  tokenAmount: 0,
  tokenId: 0,
  purpose: '',
}

const itemsForDropDown = [
  {
    text: 'FA12',
    value: 'FA12',
  },
  {
    text: 'FA2',
    value: 'FA2',
  },
  {
    text: 'TEZ',
    value: 'TEZ',
  },
]

export const CouncilFormTransferTokens = (maxLength: CouncilMaxLength) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState(INIT_FORM)

  const ddItems = useMemo(() => itemsForDropDown.map(({ text }) => text), [])
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [tokenType, setTokenType] = useState<DropdownItemType | undefined>()

  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    receiverAddress: '',
    tokenContractAddress: '',
    tokenAmount: '',
    tokenId: '',
    purpose: '',
  })

  const { receiverAddress, tokenContractAddress, tokenAmount, tokenId, purpose } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const typeOfToken = tokenType?.value || ''
      await dispatch(
        transferTokens(receiverAddress, tokenContractAddress, +tokenAmount, typeOfToken, +tokenId, purpose),
      )

      setTokenType(undefined)
      setDdIsOpen(false)
      setForm(INIT_FORM)
      setFormInputStatus({
        receiverAddress: '',
        tokenContractAddress: '',
        tokenAmount: '',
        tokenId: '',
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

  const handleClickDropdownItem = useCallback(
    (e: string) => {
      const chosenItem = itemsForDropDown.filter((item) => item.text === e)[0]
      setTokenType(chosenItem)
      setDdIsOpen(!ddIsOpen)
    },
    [ddIsOpen],
  )

  const receiverAddressProps = {
    name: 'receiverAddress',
    value: receiverAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const receiverAddressSettings = {
    inputStatus: formInputStatus.receiverAddress,
  }

  const tokenContractAddressProps = {
    name: 'tokenContractAddress',
    value: tokenContractAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const tokenContractAddressSettings = {
    inputStatus: formInputStatus.tokenContractAddress,
  }

  const tokenAmountProps = {
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

  const tokenIdProps = {
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

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Transfer Tokens</h1>
      <p>Please enter valid function parameters for transferring tokens</p>
      <div className="form-grid">
        <div>
          <label>Receiver’s Address</label>
          <Input inputProps={receiverAddressProps} settings={receiverAddressSettings} />
        </div>

        <div />

        <div>
          <label>Token Contract Address</label>
          <Input inputProps={tokenContractAddressProps} settings={tokenContractAddressSettings} />
        </div>

        <div>
          <label>Token Amount to Transfer</label>
          <Input inputProps={tokenAmountProps} settings={tokenAmountSettings} />
        </div>

        <div>
          <label>Token Type (FA12, FA2, TEZ)</label>
          <DropDown
            placeholder={'Choose token type'}
            isOpen={ddIsOpen}
            setIsOpen={setDdIsOpen}
            itemSelected={tokenType?.text}
            items={ddItems}
            clickOnItem={handleClickDropdownItem}
          />
        </div>

        <div>
          <label>Token ID</label>
          <Input inputProps={tokenIdProps} settings={tokenIdSettings} />
        </div>
      </div>
      <div className="textarea-group">
        <label>Purpose for Transfer</label>
        <TextArea
          required
          value={purpose}
          name="purpose"
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            handleChange(e)
          }}
          onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, maxLength.requestPurposeMaxLength)}
          inputStatus={formInputStatus.purpose}
          textAreaMaxLimit={maxLength.requestPurposeMaxLength}
        />
      </div>
      <div className="btn-group">
        <NewButton kind={ACTION_PRIMARY} type={SUBMIT}>
          <Icon id="transfer-fill" />
          Transfer Tokens
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
