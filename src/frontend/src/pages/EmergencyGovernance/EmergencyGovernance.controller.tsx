import { useState } from 'react'
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
import { useStakeUpdater } from 'providers/StakeProvider/hooks/useStakeUpdater'
import { useBreakGlassContext } from 'providers/BreakGlassProvider/breakGlass.provider'
import { useBreakGlassConfigInit } from 'providers/BreakGlassProvider/hooks/useBreakGlassConfigInit'
import { SUB_SKIP } from 'utils/api/apollo.consts'

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { eGovProposals, isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const {
    config: { glassBroken },
  } = useBreakGlassContext()

  useBreakGlassConfigInit()

  const [showInitiatePopup, setShowInitiatePopup] = useState(false)

  const { isInitialLoading: isDoormanLoading } = useStakeUpdater({
    skipAddressBalance: SUB_SKIP,
    skipStakeHistory: SUB_SKIP,
    skipUserBalance: SUB_SKIP,
  })

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all([(!isEgovLoaded || isDepsChanged) && dispatch(getEmergencyGovernanceStorage())].filter(Boolean))
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
      {isLoading || isDoormanLoading ? (
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
            isGlassBroken={glassBroken}
          />
        </>
      )}
    </Page>
  )
}
