import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { InfoBlock } from 'app/App.components/Info/info.style'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'
import { VotingProposalsArea } from 'app/App.components/VotingArea/VotingArea.controller'
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'pages/Governance/actions/GovernanceInteraction.actions'
import { getProposalStatusInfo, getShortByte } from 'pages/Governance/Governance.helpers'
import { GovRightContainerTitleArea, RightSideSubContent, RightSideSubHeader } from 'pages/Governance/Governance.style'
import { dropProposal } from 'pages/ProposalSubmission/ProposalSubmission.actions'
import { TzAddress } from 'pages/Treasury/Treasury.style'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { PRECISION_NUMBER } from 'utils/constants'
import getTimestampByLevel from 'utils/Fetchers/getTimestampByLevel'
import { parseDate } from 'utils/time'
import { GovPhases, ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
import { ProposalDetailsStyled } from './ProposalDetails.style'

export const ProposalDetails = ({ proposal }: { proposal: ProposalRecordType }) => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { whitelistTokens } = useSelector((state: State) => state.tokens)
  const { governancePhase } = useSelector((state: State) => state.governance.config)

  const isUserOwnerIfTheProposal = proposal.proposerId === accountPkh

  const {
    statusFlag,
    anyUserCanExecuteProposal,
    anyUserCanProcessProposalPayment,
    satelliteAbleToMakeProposalRoundVote,
  } = getProposalStatusInfo(
    governancePhase,
    proposal,
    0, //governanceStorage.timelockProposalId,
    false, //!onProposalHistoryPage,
    0, //governanceStorage.cycleHighestVotedProposalId,
    0, //governanceStorage.cycleCounter,
  )

  const isAbleToMakeProposalRoundVote = satelliteAbleToMakeProposalRoundVote
  const canDropPhase = [
    ProposalStatus.ACTIVE,
    ProposalStatus.LOCKED,
    ProposalStatus.ONGOING,
    ProposalStatus.UNLOCKED,
  ].includes(statusFlag)

  const isExecuteProposal = anyUserCanExecuteProposal && accountPkh
  const isPaymentProposal = anyUserCanProcessProposalPayment && accountPkh

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

  const [votingEnding, setVotingEnding] = useState<string>('')

  useEffect(() => {
    let ignore = false

    const handleGetTimestampByLevel = async () => {
      const res = await getTimestampByLevel(proposal.currentCycleEndLevel)
      if (!ignore) setVotingEnding(res)
    }
    handleGetTimestampByLevel()

    return () => {
      ignore = true
    }
  }, [proposal])

  const votingTime = new Date(votingEnding).getTime()
  const isEndedVotingTime = votingTime < Date.now()

  return (
    <ProposalDetailsStyled isAuthorized={Boolean(accountPkh)}>
      <GovRightContainerTitleArea>
        <H2Title>{proposal.title}</H2Title>
        <StatusFlag text={statusFlag} status={statusFlag} />
      </GovRightContainerTitleArea>

      {votingEnding ? (
        <RightSideSubContent id="votingDeadline">
          Voting {isEndedVotingTime ? 'ended' : 'ending'} on{' '}
          {parseDate({ time: votingTime, timeFormat: 'MMMM Do HH:mm Z' })} CEST
        </RightSideSubContent>
      ) : null}

      {statusFlag === 'UNLOCKED' ? (
        <InfoBlock className="info-block">
          <Icon id="info" />
          {isUserOwnerIfTheProposal ? (
            <p>
              Your proposal isn’t locked yet and can’t be voted on. You can lock it on the proposal submission page.
            </p>
          ) : (
            <p>
              This proposal isn’t locked yet and can’t be voted on until then. The proposer is still building it and
              will lock it in the coming days
            </p>
          )}
        </InfoBlock>
      ) : null}

      <div className="voting-proposal">
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
      </div>
      <hr />

      {proposal.description ? (
        <article>
          <RightSideSubHeader>Description</RightSideSubHeader>
          <RightSideSubContent>{proposal.description}</RightSideSubContent>
        </article>
      ) : null}

      <article>
        <RightSideSubHeader>Source Code</RightSideSubHeader>
        <RightSideSubContent>
          {proposal.sourceCode ? (
            <a href={proposal.sourceCode} target="_blank" rel="noreferrer">
              {proposal.sourceCode}
            </a>
          ) : (
            'No link to source code given'
          )}
        </RightSideSubContent>
      </article>

      <article>
        <RightSideSubHeader>Meta-Data</RightSideSubHeader>
        {proposal.proposalData?.length ? (
          <ol className="proposal-list">
            {proposal.proposalData.map((item) => {
              if (!item || !item.encoded_code) return null
              const unique = `proposalDataItem${item.id}`
              return (
                <li key={item.id}>
                  <div>
                    <div>
                      <b className="proposal-list-title">Title: {item.title}</b>
                    </div>
                    <div>
                      <b className="proposal-list-title">Bytes: </b>
                      <span className="proposal-list-bites">
                        bytes
                        {/* {visibleMeta === unique ? (
                          <span className="byte">
                            <button onClick={() => handleCopyToClipboard(item.encoded_code ?? '')}>
                              {item.encoded_code} <Icon id="copyToClipboard" />
                            </button>
                            <br />
                            <button onClick={() => setVisibleMeta('')} className="visible-button">
                              hide
                            </button>
                          </span>
                        ) : (
                          <span className="short-byte">
                            {getShortByte(item.encoded_code)}{' '}
                            <button onClick={() => setVisibleMeta(unique)} className="visible-button">
                              see all
                            </button>
                          </span>
                        )} */}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <RightSideSubContent>No proposal meta-data given</RightSideSubContent>
        )}
      </article>

      <article className="payment-data">
        <RightSideSubHeader>Payment Data</RightSideSubHeader>
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
          <RightSideSubContent>No payment data given</RightSideSubContent>
        )}
      </article>

      {proposal.proposerId ? (
        <article>
          <RightSideSubHeader>Proposer</RightSideSubHeader>
          <RightSideSubContent>
            <div className="address">
              <TzAddress tzAddress={proposal.proposerId} hasIcon={true} isBold={true} />
            </div>
          </RightSideSubContent>
        </article>
      ) : null}

      {proposal.governanceId ? (
        <article>
          <RightSideSubHeader>Governance Info</RightSideSubHeader>
          <div className="governance-contract">
            <p>Governance Contract</p>
            <TzAddress tzAddress={proposal.governanceId} hasIcon={true} isBold={true} />
          </div>
        </article>
      ) : null}
      {/* {isUserOwnerIfTheProposal && !isVisibleHistoryProposal && canDropPhase && proposal.proposerId === accountPkh ? (
        <div className="drop-proposal">
          <Button icon="close-stroke" text="Drop Proposal" kind="actionSecondary" onClick={handleDeleteProposal} />
        </div>
      ) : null} */}
    </ProposalDetailsStyled>
  )
}
