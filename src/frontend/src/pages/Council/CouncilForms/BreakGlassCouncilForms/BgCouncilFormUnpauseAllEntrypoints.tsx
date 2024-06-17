import React, { useCallback, useMemo, useState } from 'react'

// view
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CouncilFormHeaderStyled, CouncilFormStyled } from '../CouncilForm.style'
import { Multiselect } from 'app/App.components/Multiselect/Multiselect'

// utils
import { unpauseAllEntrypoints } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { handleBgCouncilContractSearch } from '../../helpers/commonCouncil.utils'

// consts
import { BgCouncilDdForms } from '../../helpers/council.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE, SUBMIT } from '../../../../app/App.components/Button/Button.constants'
import { MULTISELECT_SELECT_ALL_OPTION_VALUE } from 'app/App.components/Multiselect/Multiselect.consts'
import { UNPAUSE_ALL_ENTRYPOINTS_ACTION } from 'providers/CouncilProvider/helpers/council.consts'

// types
import { CouncilContractsMultiselectOptionType } from '../../helpers/council.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'

const INIT_FORM: { targetContracts: Array<CouncilContractsMultiselectOptionType> } = {
  targetContracts: [],
}

export function BgCouncilFormUnpauseAllEntrypoints() {
  const {
    globalLoadingState: { isActionActive },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    breakGlassCouncilActions: { actionsMapper, allPendingActions },
  } = useCouncilContext()
  const {
    contractStatuses,
    config: { isGlassBroken },
  } = useContractStatusesContext()

  const contractsSelectOptions = useMemo<Array<CouncilContractsMultiselectOptionType>>(() => {
    const contractsThatHasPausedMethods = contractStatuses.filter(({ methods }) =>
      Object.values(methods).some((methodStatus) => methodStatus),
    )

    return contractsThatHasPausedMethods.length
      ? [
          {
            label: 'All',
            value: MULTISELECT_SELECT_ALL_OPTION_VALUE,
            address: '',
          },
        ].concat(
          contractsThatHasPausedMethods.map(({ address, title }) => ({
            label: title,
            value: title,
            address,
          })),
        )
      : []
  }, [contractStatuses])

  const [form, setForm] = useState(INIT_FORM)

  const { targetContracts } = form

  const contractsToUnpause = useMemo(
    () =>
      targetContracts
        .filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE)
        .map(({ address }) => address),
    [targetContracts],
  )

  const unpauseAllEntrypointsActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNPAUSE_ALL_ENTRYPOINTS_ACTION,
      actionFn: async () => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await unpauseAllEntrypoints(breakGlassAddress, contractsToUnpause)
      },
    }),
    [breakGlassAddress, contractsToUnpause, userAddress],
  )

  const { action: handleUnpauseAllEntrypoints } = useContractAction(unpauseAllEntrypointsActionProps)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await handleUnpauseAllEntrypoints()

      setForm(INIT_FORM)
    } catch (error) {
      console.error('BgCouncilFormUnpauseAllEntrypoints', error)
    }
  }

  const handleContractSelect = useCallback((targetContracts: ReadonlyArray<CouncilContractsMultiselectOptionType>) => {
    setForm((prev) => {
      return { ...prev, targetContracts: [...targetContracts] }
    })
  }, [])

  const isButtonDisabled =
    isActionActive ||
    !isGlassBroken ||
    contractsToUnpause.length === 0 ||
    Boolean(
      allPendingActions.find(
        (actionId) => actionsMapper[actionId].actionClientId === BgCouncilDdForms.UNPAUSE_ALL_ENTRYPOINTS,
      ),
    )

  return (
    <CouncilFormStyled $formName={BgCouncilDdForms.UNPAUSE_ALL_ENTRYPOINTS}>
      <a
        className="info-link"
        href="https://mavenfinance.io/litepaper#break-glass-council"
        target="_blank"
        rel="noreferrer"
      >
        <Icon id="question" />
      </a>

      <CouncilFormHeaderStyled>
        <H2Title>Unpause All Entrypoints</H2Title>
        <div className="descr">Please enter valid function parameters for unpausing all entrypoints</div>
      </CouncilFormHeaderStyled>

      <form onSubmit={handleSubmit}>
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
            <Icon id="unpause" />
            Unpause All Entrypoints
          </NewButton>
        </div>
      </form>
    </CouncilFormStyled>
  )
}
