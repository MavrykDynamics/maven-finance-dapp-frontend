import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// consts
import { BUTTON_SECONDARY, BUTTON_SIMPLE, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { PRECISION_NUMBER } from 'utils/constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

// helpers & actions
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import { parseDate } from 'utils/time'
import getTimestampByLevel from 'utils/Fetchers/getTimestampByLevel'
import { dropProposal } from 'pages/ProposalSubmission/ProposalSubmission.actions'

// types
import { State } from 'reducers'
import { ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'

// compoents
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Info } from 'app/App.components/Info/Info.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { VotingProposalsArea } from 'app/App.components/VotingArea/VotingArea.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ProposalDetailsStyled } from './ProposalDetails.style'
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'pages/Governance/actions/Proposals.actions'
import { TzAddress, handleCopyToClipboard } from 'app/App.components/TzAddress/TzAddress.view'

export const ProposalDetails = ({ proposal }: { proposal: ProposalRecordType }) => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { whitelistTokens } = useSelector((state: State) => state.tokens)

  const isUserOwnerIfTheProposal = proposal.proposerId === accountPkh

  // User can drop proposal only if he is owner and proposal in newly created, or on voting stage
  const userCanDropProposal =
    isUserOwnerIfTheProposal &&
    (proposal.status === ProposalStatus.LOCKED ||
      proposal.status === ProposalStatus.ONGOING ||
      proposal.status === ProposalStatus.UNLOCKED)

  const isExecuteProposal = proposal.anyCanExecute && accountPkh
  const isPaymentProposal = proposal.anyCanPay && accountPkh

  // Proposal actions
  const handleDeleteProposal = async () => await dispatch(dropProposal(proposal.id))
  const handleClickExecuteProposal = async () => await dispatch(executeProposal(proposal.id))
  const handleClickProcessPayment = async () => await dispatch(processProposalPayment(proposal.id))
  const handleProposalRoundVote = async (proposalId: number) => await dispatch(proposalRoundVote(proposalId))
  const handleVotingRoundVote = async (vote: `${VotingTypes}`) => await dispatch(votingRoundVote(vote))

  // Voting stuff
  const voteStatistics = useMemo<VoteStatistics>(
    () => ({
      abstainVotesMVKTotal: proposal.abstainMvkTotal,
      againstVotesMVKTotal: proposal.downvoteMvkTotal,
      forVotesMVKTotal: proposal.upvoteMvkTotal,
      unusedVotesMVKTotal: Math.round(
        proposal.quorumMvkTotal - proposal.abstainMvkTotal - proposal.downvoteMvkTotal - proposal.upvoteMvkTotal,
      ),
      passVotesMVKTotal: proposal.passVoteMvkTotal,
      quorum: proposal.minQuorumPercentage,
    }),
    [proposal],
  )

  // Loading voting till time for proposal
  const [votingTill, setVotingTill] = useState<null | number>(null)
  useEffect(() => {
    let ignore = false

    const handleGetTimestampByLevel = async () => {
      const res = await getTimestampByLevel(proposal.currentCycleEndLevel)
      if (!ignore) setVotingTill(new Date(res).getTime())
    }
    handleGetTimestampByLevel()

    return () => {
      ignore = true
    }
  }, [proposal])

  // store bytes that are opened
  const [openedBytes, setOpenedBytes] = useState<Array<number>>([])

  return (
    <ProposalDetailsStyled isAuthorized={Boolean(accountPkh)}>
      <div className="title-status">
        <H2Title>{proposal.title}</H2Title>
        <StatusFlag text={proposal.status} status={proposal.status} />
      </div>

      {votingTill ? (
        <div className="voting-ends">
          Voting {votingTill <= Date.now() ? 'ended' : 'ending'} on{' '}
          {parseDate({ time: votingTill, timeFormat: 'MMMM Do HH:mm Z' })} CEST
        </div>
      ) : null}

      {proposal.status === ProposalStatus.UNLOCKED ? (
        <Info
          type={INFO_DEFAULT}
          text={
            isUserOwnerIfTheProposal
              ? 'Your proposal isn’t locked yet and can’t be voted on. You can lock it on the proposal submission page.'
              : 'This proposal isn’t locked yet and can’t be voted on until then. The proposer is still building it and will lock it in the coming days.'
          }
        />
      ) : null}

      {/* TODO: pass new set of props to it and consider take out all voting and button in separate compnent */}
      {/* <div className="voting-proposal">
        <VotingProposalsArea
          voteStatistics={voteStatistics}
          shownBlock={'bar'}
          votingPhaseHandler={handleVotingRoundVote}
          handleProposalVote={handleProposalRoundVote}
          selectedProposal={proposal}
          vote={proposal.votes.find(
            ({ voter_id, round }) =>
              voter_id === accountPkh && round === (governancePhase === GovPhases.PROPOSAL ? 0 : 1),
          )}
        />

        {isExecuteProposal ? (
          <Button
            className="execute-proposal"
            text="Execute Proposal"
            onClick={handleClickExecuteProposal}
            kind="actionPrimary"
          />
        ) : null}
        {isPaymentProposal ? (
          <Button
            className="execute-proposal"
            text="Process Payment"
            onClick={handleClickProcessPayment}
            kind="actionPrimary"
          />
        ) : null}
      </div> */}
      <hr />

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Description</div>
        <div className="proposal-data-block-value">{proposal.description}</div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Source Code</div>
        <div className="proposal-data-block-value">
          <a href={proposal.sourceCode} target="_blank" rel="noreferrer" className="isCyan">
            {proposal.sourceCode}
          </a>
        </div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Meta-Data</div>
        {proposal.proposalData?.length ? (
          <ol className="bytes-list">
            {proposal.proposalData.map((item) => {
              if (!item || !item.encoded_code) return null
              const isByteOpened = openedBytes.includes(item.id)
              const byteText = item.encoded_code
              return (
                <li key={item.id}>
                  <div className="title" style={{ paddingLeft: '15px' }}>
                    {item.title}
                  </div>

                  <div className={`byte ${isByteOpened ? 'opened' : ''}`}>
                    <div className="title" style={{ marginRight: '5px' }}>
                      Bytes:
                    </div>

                    <div className={`byte-content`}>
                      <div
                        className="byte-text"
                        onClick={isByteOpened ? () => dispatch(handleCopyToClipboard(byteText)) : undefined}
                      >
                        {byteText} {isByteOpened ? <Icon id="copyToClipboard" /> : null}
                      </div>
                    </div>

                    <Button
                      kind={BUTTON_SIMPLE_SMALL}
                      onClick={() =>
                        setOpenedBytes(
                          isByteOpened ? openedBytes.filter((id) => id !== item.id) : [...openedBytes, item.id],
                        )
                      }
                    >
                      {isByteOpened ? 'hide' : 'see all'}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <div className="proposal-data-block-value">No proposal meta-data given</div>
        )}
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Payment Data</div>
        {proposal.proposalPayments?.length ? (
          <Table className="editable-table with-header">
            <TableHeader className="editable-head proposal-details-payments">
              <TableRow>
                <TableHeaderCell className="no-right-border">Address</TableHeaderCell>
                <TableHeaderCell>Purpose</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell className="right-border">Payment Type (XTZ/MVK)</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposal.proposalPayments.map((payment) => {
                const { symbol: selectedSymbol = 'MVK' } =
                  whitelistTokens.find(({ address }) => address === payment.token_address) ?? whitelistTokens?.[0] ?? {}

                return (
                  <TableRow className="editable-row proposal-details-payments">
                    <TableCell width="25%">
                      <TzAddress tzAddress={String(payment.to__id)} type={BLUE} hasIcon={false} />
                    </TableCell>
                    <TableCell width="25%">{String(payment.title)}</TableCell>
                    <TableCell width="25%">
                      <CommaNumber value={Number(payment.token_amount)} endingText={selectedSymbol} />
                    </TableCell>
                    <TableCell className="no-right-border" width="25%">
                      {selectedSymbol}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="proposal-data-block-value">No payment data given</div>
        )}
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Proposer</div>
        <div className="proposal-data-block-value">
          <TzAddress tzAddress={proposal.proposerId} type={BLUE} isBold />
        </div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Governance Info</div>
        <div className="gov-data">
          <div className="proposal-data-block-name">Governance Contract</div>
          <div className="proposal-data-block-value">
            <TzAddress tzAddress={proposal.governanceId} type={BLUE} isBold />
          </div>
        </div>
      </div>

      <div className="drop-proposal">
        <Button kind={BUTTON_SECONDARY} onClick={handleDeleteProposal} disabled={!userCanDropProposal}>
          <Icon id="navigation-menu_close" />
          Drop Proposal
        </Button>
      </div>
    </ProposalDetailsStyled>
  )
}
