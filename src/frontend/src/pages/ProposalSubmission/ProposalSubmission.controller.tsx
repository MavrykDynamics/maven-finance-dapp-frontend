import QueryString from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, Redirect } from 'react-router'

import { State } from 'reducers'

import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { ProposalSubmissionView } from './ProposalSubmission.view'

import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { DEFAULT_PROPOSAL } from './ProposalSubmission.helpers'
import { getTreasuryStorage } from 'pages/Treasury/Treasury.actions'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    currentRoundProposalsIds,
    proposalsMapper,
    isLoaded: isGovernanceLoaded,
  } = useSelector((state: State) => state.governance)
  const { isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isTreasuryLoaded || isDepsChanged) && dispatch(getTreasuryStorage()),
          (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { proposalId: string }

  const userProposals = currentRoundProposalsIds.filter(
    (proposalId) => proposalsMapper[proposalId].proposerId === accountPkh,
  )

  const convertedProposalId = parsedQp.proposalId ? Number(parsedQp.proposalId) : null
  const isValidProposalId =
    convertedProposalId && convertedProposalId > DEFAULT_PROPOSAL.id
      ? userProposals.includes(convertedProposalId)
      : true

  const redirect =
    userProposals.length >= 2 && convertedProposalId === DEFAULT_PROPOSAL.id ? (
      <Redirect to={`/submit-proposal?${QueryString.stringify({ proposalId: userProposals[0] })}`} />
    ) : convertedProposalId && isValidProposalId ? null : (
      <Redirect to={`/submit-proposal?${QueryString.stringify({ proposalId: userProposals[0] ?? -1 })}`} />
    )

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading your proposals</div>
        </DataLoaderWrapper>
      ) : (
        redirect ?? <ProposalSubmissionView selectedUserProposalId={Number(parsedQp.proposalId)} />
      )}
    </Page>
  )
}
