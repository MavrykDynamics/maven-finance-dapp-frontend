import { useMemo, useState } from 'react'

// helpers
import { validateFormAddress } from 'utils/validatorFunctions'
import { removeVesteeRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { CouncilFormStyled } from './CouncilForm.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../app/App.components/Icon/Icon.view'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_DEFAULT, type InputStatusType } from '../../../app/App.components/Input/Input.constants'
import { REMOVE_VESTEE_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

const INIT_FORM = {
  vesteeAddress: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  vesteeAddress: INPUT_STATUS_DEFAULT,
}

export const CouncilFormRemoveVestee = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

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

        if (!vesteeAddress) {
          bug('Enter vestee address to remove')
          return null
        }

        return await removeVesteeRequest(vesteeAddress, councilAddress)
      },
    }),
    [vesteeAddress, userAddress, councilAddress],
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

  const handleBlurAddress = validateFormAddress(setFormInputStatus)

  const vesteeAddressProps = {
    name: 'vesteeAddress',
    value: vesteeAddress,
    onBlur: handleBlurAddress,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      handleChange(e)
      handleBlurAddress(e)
    },
    required: true,
  }

  const vesteeAddressSettings = {
    inputStatus: formInputStatus.vesteeAddress,
  }

  return (
    <CouncilFormStyled onSubmit={handleSubmit}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Remove Vestee</h1>
      <p>Please enter valid function parameters for removing vestee</p>
      <div className="form-grid form-grid-button-right">
        <div>
          <label>Vestee Address</label>
          <Input inputProps={vesteeAddressProps} settings={vesteeAddressSettings} />
        </div>
        <div className="button-aligment">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isActionActive}>
            <Icon id="minus" />
            Remove Vestee
          </NewButton>
        </div>
      </div>
    </CouncilFormStyled>
  )
}
