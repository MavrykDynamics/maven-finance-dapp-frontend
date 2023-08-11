import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'

import { getEmergencyGovernanceStorage } from './EmergencyGovernance.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { EmergencyGovernanceView } from './EmergencyGovernance.view'
import { EmergencyGovProposalModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// providers
import { SUB_SKIP } from 'utils/api/apollo.consts'
import { useContractStatusConfig } from 'providers/ContractStatuses/hooks/useContractStatusesConfig'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { DAPP_MVK_SMVK_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()

  const { changeStakingSubscriptionsList, isLoading: isDoormanLoading } = useDoormanContext()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { eGovProposals, isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)

  const { isLoading: isContractStatusConfigLoading, isGlassBroken } = useContractStatusConfig({
    skipWhitelistDevelopers: SUB_SKIP,
  })

  const [showInitiatePopup, setShowInitiatePopup] = useState(false)

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
    })

    return () => changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
  }, [])

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isEgovLoaded || isDepsChanged) {
        await dispatch(getEmergencyGovernanceStorage())
      }
    } catch (e) {}
  }, [])

  const closeInitiatePopup = () => {
    setShowInitiatePopup(false)
  }

  const openInitiatePopup = () => {
    setShowInitiatePopup(true)
  }

  return (
    <Page>
      <PageHeader page={'emergency governance'} />
      {isLoading || isDoormanLoading || isContractStatusConfigLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading emergency governance proposals</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <EmergencyGovProposalModal show={showInitiatePopup} closeHandler={closeInitiatePopup} />
          <EmergencyGovernanceView
            handleTriggerEmergencyProposal={openInitiatePopup}
            accountPkh={accountPkh}
            emergencyGovernanceLedger={eGovProposals}
            isGlassBroken={isGlassBroken}
          />
        </>
      )}
    </Page>
  )
}
