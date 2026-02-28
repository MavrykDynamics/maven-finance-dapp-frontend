import { useLayoutEffect } from 'react'
import { useLocation, Navigate } from 'react-router'
import QueryString from 'qs'

// view
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { ProposalSubmissionView } from './ProposalSubmission.view'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// providers
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

// consts
import { DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_DATA_SUB } from 'providers/TreasuryProvider/helpers/treasury.consts'
import {
  DEFAULT_PROPOSALS_ACTIVE_SUBS,
  GOVERNANCE_CONFIG_SUB,
  PROPOSALS_DATA_SUB,
  PROPOSALS_SUBMISSION_DATA,
} from 'providers/ProposalsProvider/helpers/proposals.const'
import { DEFAULT_PROPOSAL } from './helpers/proposalSubmission.const'

export const ProposalSubmission = () => {
  const { search } = useLocation()

  const {
    isLoading: isProposalsLoading,
    submissionProposalsIds,
    changeProposalsSubscriptionsList,
  } = useProposalsContext()
  const { isLoading: isTreasuryLoading, changeTreasurySubscriptionsList } = useTreasuryContext()

  useLayoutEffect(() => {
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })
    changeProposalsSubscriptionsList({
      [PROPOSALS_DATA_SUB]: PROPOSALS_SUBMISSION_DATA,
      [GOVERNANCE_CONFIG_SUB]: true,
    })

    return () => {
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
      changeProposalsSubscriptionsList(DEFAULT_PROPOSALS_ACTIVE_SUBS)
    }
  }, [])

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { proposalId: string }

  const convertedProposalId = parsedQp.proposalId ? Number(parsedQp.proposalId) : null
  const isValidProposalId =
    convertedProposalId && convertedProposalId > DEFAULT_PROPOSAL.id
      ? submissionProposalsIds.includes(convertedProposalId)
      : true

  const redirect =
    submissionProposalsIds.length >= 2 && convertedProposalId === DEFAULT_PROPOSAL.id ? (
      <Navigate to={`/submit-proposal?${QueryString.stringify({ proposalId: submissionProposalsIds[0] })}`} />
    ) : convertedProposalId && isValidProposalId ? null : (
      <Navigate to={`/submit-proposal?${QueryString.stringify({ proposalId: submissionProposalsIds[0] ?? -1 })}`} />
    )

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      {isTreasuryLoading || isProposalsLoading ? (
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
