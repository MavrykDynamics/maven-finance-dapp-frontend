import React, { useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilFormStyled, CouncilFormHeaderStyled } from '../CouncilForm.style'

// consts
import { SET_ALL_CONTRACTS_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../../app/App.components/Button/Button.constants'
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BgCounsilDdForms } from '../../helpers/council.consts'

// utils
import { setAllContractsAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

const INIT_FORM = {
  newAdminAddress: '',
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newAdminAddress: INPUT_STATUS_DEFAULT,
}

export function BgCouncilFormSetAllContractsAdmin() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newAdminAddress } = form

  const setAllContractsAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_ALL_CONTRACTS_ADMIN_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await setAllContractsAdmin(breakGlassAddress, newAdminAddress)
      },
    }),
    [breakGlassAddress, newAdminAddress, userAddress],
  )

  const { action: handleSetAllContractAdmin } = useContractAction(setAllContractsAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetAllContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormSetAllContractsAdminView', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const { adminAddressProps, adminAddressSettings } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)

    const adminAddressProps = {
      name: 'newAdminAddress',
      value: newAdminAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    return {
      adminAddressProps,
      adminAddressSettings: {
        inputStatus: formInputStatus.newAdminAddress,
      },
    }
  }, [formInputStatus.newAdminAddress, newAdminAddress])

  const isButtonDisabled =
    isActionActive || Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  return (
    <CouncilFormStyled formName={BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN}>
      <a
        className="info-link"
        href="https://mavryk.finance/litepaper#break-glass-council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Set All Contracts Admin</H2Title>
        <div className="descr">Please enter valid function parameters for setting admin</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="admin-address ">
          <label>New Admin Address</label>

          <Input inputProps={adminAddressProps} settings={adminAddressSettings} />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="profile" />
            Set Contracts Admin
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
