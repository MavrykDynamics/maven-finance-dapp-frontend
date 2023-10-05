import React, { useCallback, useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilFormStyled, CouncilFormHeaderStyled } from '../CouncilForm.style'
import { Multiselect } from 'app/App.components/Multiselect/Multiselect'

// utils
import { setSelectedContractsAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { handleBgCouncilContractSearch } from '../../helpers/commonCouncil.utils'
import { validateFormAddress } from 'utils/validatorFunctions'

// consts
import { BgCounsilDdForms } from '../../helpers/council.consts'
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../../app/App.components/Button/Button.constants'
import { MULTISELECT_SELECT_ALL_OPTION_VALUE } from 'app/App.components/Multiselect/Multiselect.consts'
import { SET_SELECTED_CONTRACTS_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// types
import { CouncilContractsMultiselectOptionType } from '../../helpers/council.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

const INIT_FORM: { newAdminAddress: string; targetContracts: Array<CouncilContractsMultiselectOptionType> } = {
  newAdminAddress: '',
  targetContracts: [],
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newAdminAddress: INPUT_STATUS_DEFAULT,
}

export function BgCouncilFormSetSelectedContractsAdminView() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
    dappContracts,
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const contractsSelectOptions = useMemo<Array<CouncilContractsMultiselectOptionType>>(
    () =>
      [
        {
          label: 'All',
          value: MULTISELECT_SELECT_ALL_OPTION_VALUE,
          address: '',
        },
      ].concat(
        dappContracts.map(({ address, name }) => ({
          label: name,
          value: name,
          address,
        })),
      ),
    [dappContracts],
  )

  const [form, setForm] = useState(INIT_FORM)
  const [formInputStatus, setFormInputStatus] = useState(INIT_FORM_VALIDATION)

  const { newAdminAddress, targetContracts } = form

  const contractsWhereChangeAdmin = useMemo(
    () =>
      targetContracts
        .filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE)
        .map(({ address }) => address),
    [targetContracts],
  )

  const setSelectedContractsAdminContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_SELECTED_CONTRACTS_ADMIN_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await setSelectedContractsAdmin(breakGlassAddress, newAdminAddress, contractsWhereChangeAdmin)
      },
    }),
    [breakGlassAddress, newAdminAddress, contractsWhereChangeAdmin, userAddress],
  )

  const { action: handleSetSingleContractAdmin } = useContractAction(setSelectedContractsAdminContractActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleSetSingleContractAdmin()

      setForm(INIT_FORM)
      setFormInputStatus(INIT_FORM_VALIDATION)
    } catch (error) {
      console.error('FormSetSingleContractAdminView', error)
    }
  }

  const handleContractSelect = useCallback((targetContracts: ReadonlyArray<CouncilContractsMultiselectOptionType>) => {
    setForm((prev) => {
      return { ...prev, targetContracts: [...targetContracts] }
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const isButtonDisabled =
    isActionActive ||
    contractsWhereChangeAdmin.length === 0 ||
    Object.values(formInputStatus).some((status) => status !== INPUT_STATUS_SUCCESS)

  const { newAdminAddressProps, newAdminAddressSettings } = useMemo(() => {
    const validateAddress = validateFormAddress(setFormInputStatus)

    const newAdminAddressProps = {
      name: 'newAdminAddress',
      value: newAdminAddress,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(e)
        validateAddress(e)
      },
      required: true,
    }

    return {
      newAdminAddressProps,
      newAdminAddressSettings: {
        inputStatus: formInputStatus.newAdminAddress,
      },
    }
  }, [formInputStatus.newAdminAddress, newAdminAddress])

  return (
    <CouncilFormStyled formName={BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN}>
      <a
        className="info-link"
        href="https://mavryk.finance/litepaper#break-glass-council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Set Single Contract Admin</H2Title>
        <div className="descr">Please enter valid function parameters for setting admin</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
        <div className="admin-address">
          <label>New Admin Address</label>
          <Input className="margin-bottom-20" inputProps={newAdminAddressProps} settings={newAdminAddressSettings} />
        </div>

        <div className="select-contracts">
          <label>Choose Target Contracts</label>
          <Multiselect<CouncilContractsMultiselectOptionType>
            options={contractsSelectOptions}
            selectedOptions={targetContracts}
            selectHandler={handleContractSelect}
            searchHandler={handleBgCouncilContractSearch}
            placeholder="Choose target contracts"
          />
        </div>

        <div className="submit-form">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="profile" />
            Set Contract Admin
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
