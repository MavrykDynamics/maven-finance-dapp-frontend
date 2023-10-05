import { useMemo, useState } from 'react'

// consts
import { MavrykCounsilDdForms } from '../../helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from 'app/App.components/Button/Button.constants'
import { SET_BAKER_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import {
  INPUT_STATUS_DEFAULT,
  INPUT_STATUS_SUCCESS,
  InputStatusType,
} from '../../../../app/App.components/Input/Input.constants'

// helpers
import { setBakerRequest } from 'providers/CouncilProvider/actions/mavrykCounsil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// view
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../../../../app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM = {
  bakerHash: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  bakerHash: INPUT_STATUS_DEFAULT,
}

export const MavCouncilFormSetBaker = () => {
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { councilAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { bakerHash } = form

  // set baker council action
  const setBakerContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_BAKER_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!councilAddress) {
          bug('Wrong council address')
          return null
        }

        return await setBakerRequest(bakerHash, councilAddress)
      },
    }),
    [bakerHash, userAddress, councilAddress],
  )

  const { action: handleSetBaker } = useContractAction(setBakerContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await handleSetBaker()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('CouncilFormSetBaker', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { bakerHashProps, bakerHashSettings } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)

    const bakerHashProps = {
      name: 'bakerHash',
      value: bakerHash,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    return {
      bakerHashProps,
      bakerHashSettings: {
        inputStatus: formInputStatus.bakerHash,
      },
    }
  }, [bakerHash, formInputStatus.bakerHash])

  return (
    <CouncilFormStyled formName={MavrykCounsilDdForms.SET_BAKER}>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Set Baker</H2Title>
        <div className="descr">Please enter valid function parameters for setting a baker</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="baker-hash">
          <label>Baker Hash</label>
          <Input inputProps={bakerHashProps} settings={bakerHashSettings} />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="plus" />
            Set Baker
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
