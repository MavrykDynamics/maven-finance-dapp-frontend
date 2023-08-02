import QueryString from 'qs'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, Redirect } from 'react-router'

// types
import { State } from 'reducers'

// data
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getTreasuryStorage } from 'pages/Treasury/Treasury.actions'
import { DEFAULT_PROPOSAL } from './ProposalSubmission.helpers'

// view
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const ProposalSubmission = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const { isLoading: isProposalsLoading, submissionProposalsIds } = useProposalsContext()

  const { isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all([(!isTreasuryLoaded || isDepsChanged) && dispatch(getTreasuryStorage())].filter(Boolean))
    } catch (e) {}
  }, [])

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { proposalId: string }

  const convertedProposalId = parsedQp.proposalId ? Number(parsedQp.proposalId) : null
  const isValidProposalId =
    convertedProposalId && convertedProposalId > DEFAULT_PROPOSAL.id
      ? submissionProposalsIds.includes(convertedProposalId)
      : true

  const redirect =
    submissionProposalsIds.length >= 2 && convertedProposalId === DEFAULT_PROPOSAL.id ? (
      <Redirect to={`/submit-proposal?${QueryString.stringify({ proposalId: submissionProposalsIds[0] })}`} />
    ) : convertedProposalId && isValidProposalId ? null : (
      <Redirect to={`/submit-proposal?${QueryString.stringify({ proposalId: submissionProposalsIds[0] ?? -1 })}`} />
    )

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      {isLoading || isProposalsLoading ? (
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
