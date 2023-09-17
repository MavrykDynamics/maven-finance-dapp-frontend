import { useEffect, useMemo, useState } from 'react'

// consts
import { TREASURY_STORAGE_DATA_SUB, DEFAULT_TREASURY_SUBS } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { REQUEST_TOKENS_MINT_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_ERROR,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../../app/App.components/Input/Input.constants'

// helpers
import { requestTokenMint } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress, validateFormField } from 'utils/validatorFunctions'

// types
import { TreasuryData } from 'providers/TreasuryProvider/helpers/treasury.types'
import { CouncilMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { CouncilFormStyled } from './CouncilForm.style'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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

// TODO: implement inputs validation after clarification with sam
export const CouncilFormRequestTokenMint = (maxLength: CouncilMaxLength) => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  // const {
  //   changeTreasurySubscriptionsList,
  //   isLoading: isTreasuryLoading,
  //   treasuryAddresses,
  //   treasuryMapper,
  // } = useTreasuryContext()

  // useEffect(() => {
  //   changeTreasurySubscriptionsList({
  //     [TREASURY_STORAGE_DATA_SUB]: true,
  //   })

  //   return () => {
  //     changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
  //   }
  // }, [])

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)
  // const [selectedTreasury, setSelectedTreasury] = useState<TreasuryData | undefined>()
  // const [tokenAmountInTreasury, setTokenAmountInTreasury] = useState<number | undefined>()

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

        return await requestTokenMint(treasuryAddress, Number(tokenAmount), purpose, councilAddress)
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

  const handleBlur = validateFormField(setFormInputStatus)
  const handleBlurAddress = validateFormAddress(setFormInputStatus)

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

  const tokenAmountProps = {
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

  const inputPinnedChild = <div className="pinned-child">MVK</div>

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Request Token Mint</h1>
      <p>Please enter valid function parameters for requesting token mint</p>
      <div className="form-grid">
        <div>
          <label>Treasury Address</label>
          <Input inputProps={treasuryAddressProps} settings={treasuryAddressSettings} />
        </div>

        <div>
          <label>Token Amount</label>
          <Input
            className="transparent-child-wrap"
            children={inputPinnedChild}
            inputProps={tokenAmountProps}
            settings={tokenAmountSettings}
          />
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
          <Icon id="loans" />
          Request Mint
        </NewButton>
      </div>
    </CouncilFormStyled>
  )
}
