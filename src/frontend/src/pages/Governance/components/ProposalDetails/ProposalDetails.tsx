import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// consts
import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { PRECISION_NUMBER } from 'utils/constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

// helpers & actions
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'pages/Governance/actions/GovernanceInteraction.actions'
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
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ProposalDetailsStyled } from './ProposalDetails.style'

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
  const handleDeleteProposal = async () => {
    if (isUserOwnerIfTheProposal) await dispatch(dropProposal(proposal.id))
  }

  const handleClickExecuteProposal = () => {
    dispatch(executeProposal(proposal.id))
  }

  const handleClickProcessPayment = async () => {
    dispatch(processProposalPayment(proposal.id))
  }

  const paymentMethods = useMemo(
    () =>
      whitelistTokens
        .map((tokenInfo) => ({
          symbol: tokenInfo.contract_name,
          address: tokenInfo.contract_address,
          shortSymbol: tokenInfo.token_contract_standard,
          id: 0,
        }))
        .filter(({ shortSymbol }) => ['fa2', 'fa12', 'tez'].includes(shortSymbol)),
    [whitelistTokens],
  )

  // Voting stuff
  const voteStatistics = useMemo<VoteStatistics>(
    () => ({
      abstainVotesMVKTotal: Number(proposal.abstainMvkTotal),
      againstVotesMVKTotal: Number(proposal.downvoteMvkTotal),
      forVotesMVKTotal: Number(proposal.upvoteMvkTotal),
      unusedVotesMVKTotal: Math.round(
        proposal.quorumMvkTotal / PRECISION_NUMBER -
          proposal.abstainMvkTotal -
          proposal.downvoteMvkTotal -
          proposal.upvoteMvkTotal,
      ),
      passVotesMVKTotal: Number(proposal.passVoteMvkTotal),
      quorum: proposal.minQuorumPercentage,
    }),
    [proposal],
  )

  //TODO: add voting power to the vote
  const handleProposalRoundVote = async (proposalId: number) => {
    await dispatch(proposalRoundVote(proposalId))
  }

  //TODO: add voting power to the vote
  const handleVotingRoundVote = async (vote: string) => {
    switch (vote) {
      case VotingTypes.YES:
        dispatch(votingRoundVote(VotingTypes.YES))
        break
      case VotingTypes.NO:
        dispatch(votingRoundVote(VotingTypes.NO))
        break
      case VotingTypes.PASS:
        dispatch(votingRoundVote(VotingTypes.PASS))
        break
    }
  }

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
          <div className="bytes-list">
            {proposal.proposalData.map((item) => {
              // if (!item || !item.encoded_code) return null
              // const unique = `proposalDataItem${item.id}`
              // return (
              //   <li key={item.id}>
              //     <div>
              //       <div>
              //         <b className="proposal-list-title">Title: {item.title}</b>
              //       </div>
              //       <div>
              //         <b className="proposal-list-title">Bytes: </b>
              //         <span className="proposal-list-bites">
              //          {visibleMeta === unique ? (
              //             <span className="byte">
              //               <button onClick={() => handleCopyToClipboard(item.encoded_code ?? '')}>
              //                 {item.encoded_code} <Icon id="copyToClipboard" />
              //               </button>
              //               <br />
              //               <button onClick={() => setVisibleMeta('')} className="visible-button">
              //                 hide
              //               </button>
              //             </span>
              //           ) : (
              //             <span className="short-byte">
              //               {getShortByte(item.encoded_code)}{' '}
              //               <button onClick={() => setVisibleMeta(unique)} className="visible-button">
              //                 see all
              //               </button>
              //             </span>
              //           )}
              //         </span>
              //       </div>
              //     </div>
              //   </li>
              // )
              return <div className="bytes-list-item">byte</div>
            })}
          </div>
        ) : (
          <div className="proposal-data-block-value">No proposal meta-data given</div>
        )}
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Payment Data</div>
        {proposal.proposalPayments?.length ? (
          <Table className="editable-table">
            <TableHeader className="editable-head">
              <TableRow>
                <TableHeaderCell className="no-right-border">Address</TableHeaderCell>
                <TableHeaderCell>Purpose</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell className="right-border">Payment Type (XTZ/MVK)</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody className="editable-body">
              {proposal.proposalPayments.map((payment) => {
                const { symbol: selectedSymbol = 'MVK' } =
                  paymentMethods.find(({ address }) => address === payment.token_address) ?? paymentMethods?.[0] ?? {}

                return (
                  <TableRow className="editable-row">
                    <TableCell width="25%">
                      <TzAddress
                        tzAddress={String(payment.to__id)}
                        type={BLUE}
                        hasIcon={true}
                        className="table-cell-tzAddress"
                      />
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
          <TzAddress tzAddress={proposal.proposerId} hasIcon isBold={true} />
        </div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Governance Info</div>
        <div className="gov-data">
          <div className="proposal-data-block-name">Governance Contract</div>
          <div className="proposal-data-block-value">
            <TzAddress tzAddress={proposal.governanceId} hasIcon isBold={true} />
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
