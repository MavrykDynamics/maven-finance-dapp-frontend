import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'

import { getEmergencyGovernanceStorage } from './EmergencyGovernance.actions'
import { getBreakGlassConfig } from '../BreakGlass/BreakGlass.actions'
import { dropProposal } from 'pages/ProposalSubmission/ProposalSubmission.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { EmergencyGovernanceView } from './EmergencyGovernance.view'
import { EmergencyGovProposalModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const EmergencyGovernance = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { eGovProposals, isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)
  const { glassBroken, isConfigLoaded: isBreakGlassConfigLoaded } = useSelector(
    (state: State) => state.breakGlass.config,
  )
  const { isLoaded: isDoormanLoaded } = useSelector((state: State) => state.doorman)

  const [showInitiatePopup, setShowInitiatePopup] = useState(false)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          !isBreakGlassConfigLoaded && dispatch(getBreakGlassConfig()),
          !isDoormanLoaded && dispatch(getDoormanStorage()),
          !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const dropProposalHandler = (proposalId: number) => {
    dispatch(dropProposal(proposalId))
  }

  const closeInitiatePopup = () => {
    setShowInitiatePopup(false)
  }

  const openInitiatePopup = () => {
    setShowInitiatePopup(true)
  }

  return (
    <Page>
      <PageHeader page={'emergency governance'} />
      {isLoading ? (
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
            dropProposalHandler={dropProposalHandler}
            isGlassBroken={glassBroken}
          />
        </>
      )}
    </Page>
  )
}
