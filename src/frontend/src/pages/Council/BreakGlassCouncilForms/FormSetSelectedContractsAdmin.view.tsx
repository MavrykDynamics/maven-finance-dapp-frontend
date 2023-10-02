import React, { useMemo, useState } from 'react'

// view
import { Input } from 'app/App.components/Input/NewInput'
import NewButton from 'app/App.components/Button/NewButton'
import { BreakGlassCouncilFormStyled } from './BreakGlassCouncilForm.style'
import Icon from 'app/App.components/Icon/Icon.view'

// utils
import { setSelectedContractsAdmin } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { validateFormAddress } from 'utils/validatorFunctions'

// consts
import { INPUT_STATUS_DEFAULT, INPUT_STATUS_SUCCESS, InputStatusType } from 'app/App.components/Input/Input.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { SET_SELECTED_CONTRACTS_ADMIN_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { Multiselect } from 'app/App.components/Multiselect/Multiselect'
import { CouncilContractsMultiselectOptionType } from '../helpers/council.types'
import { MULTISELECT_SELECT_ALL_OPTION_VALUE } from 'app/App.components/Multiselect/Multiselect.consts'

const INIT_FORM: { newAdminAddress: string; targetContracts: Array<CouncilContractsMultiselectOptionType> } = {
  newAdminAddress: '',
  targetContracts: [],
}

const INIT_FORM_VALIDATION: Record<string, InputStatusType> = {
  newAdminAddress: INPUT_STATUS_DEFAULT,
}

export function FormSetSelectedContractsAdminView() {
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
          label: 'all',
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

  const handleContractSelect = (targetContracts: ReadonlyArray<CouncilContractsMultiselectOptionType>) => {
    console.log({ targetContracts })
    // const newContracts = contracts.
    setForm((prev) => {
      return { ...prev, targetContracts: [...targetContracts] }
    })
  }

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
    <BreakGlassCouncilFormStyled>
      <h1>Set Single Contract Admin</h1>
      <p>Please enter valid function parameters for setting admin</p>

      <form className="form one-column" onSubmit={handleSubmit}>
        <div className="form-fields">
          <div className="input-size-primary">
            <label>New Admin Address</label>
            <Input className="margin-bottom-20" inputProps={newAdminAddressProps} settings={newAdminAddressSettings} />
          </div>
          <div className="input-size-full-width margin-bottom-20">
            <label>Choose Target Contracts</label>
            <Multiselect<CouncilContractsMultiselectOptionType>
              options={contractsSelectOptions}
              selectedOptions={targetContracts}
              selectHandler={handleContractSelect}
              placeholder="Choose target contracts"
            />
          </div>
        </div>

        <div className="align-to-right">
          <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} type={SUBMIT} disabled={isButtonDisabled}>
            <Icon id="profile" />
            Set Contract Admin
          </NewButton>
        </div>
      </form>
    </BreakGlassCouncilFormStyled>
  )
}
