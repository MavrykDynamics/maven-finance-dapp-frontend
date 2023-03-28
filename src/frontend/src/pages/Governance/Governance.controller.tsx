import { useDispatch, useSelector } from 'react-redux'
import { Page } from 'styles'
import { State } from 'reducers'

// actions
import { getEmergencyGovernanceStorage } from '../EmergencyGovernance/EmergencyGovernance.actions'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernanceView } from './Governance.view'
import { GovernanceTopBar } from './GovernanceTopBar/GovernanceTopBar.controller'

// hooks
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { executeProposal } from './actions/GovernanceInteraction.actions'
import { getGovernanceConfig, getGovernanceProposals } from './actions/GovernanseData.actions'

export type VoteStatistics = {
  passVotesMVKTotal: number
  forVotesMVKTotal: number
  againstVotesMVKTotal: number
  abstainVotesMVKTotal: number
  unusedVotesMVKTotal: number
}
export const Governance = () => {
  const dispatch = useDispatch()

  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    proposals: { isLoaded: isGovProposalsLoaded },
    config: { isLoaded: isGovConfigLoaded, governancePhase },
  } = useSelector((state: State) => state.governance)
  const { isLoaded: isEgovLoaded } = useSelector((state: State) => state.emergencyGovernance)

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          !isEgovLoaded && dispatch(getEmergencyGovernanceStorage()),
          !isGovProposalsLoaded && dispatch(getGovernanceProposals()),
          !isGovConfigLoaded && dispatch(getGovernanceConfig()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const handleExecuteProposal = (id: number) => dispatch(executeProposal(id))

  return (
    <Page>
      <PageHeader page={'governance'} />
      <GovernanceTopBar governancePhase={governancePhase} />
      <GovernanceView
        handleExecuteProposal={handleExecuteProposal}
        accountPkh={accountPkh}
        userIsSatellite={Boolean(isSatellite)}
        ongoingProposals={[]}
        nextProposals={[]}
        watingProposals={[]}
        waitingForPaymentToBeProcessed={[]}
        pastProposals={[]}
        governancePhase={governancePhase}
      />
    </Page>
  )
}
