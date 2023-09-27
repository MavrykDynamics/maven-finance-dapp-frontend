import { useCallback, useEffect, useMemo, useState } from 'react'

// context
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useProposalsContext } from 'providers/ProposalsProvider/proposals.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import colors from 'styles/colors'

// utils
import { api } from 'utils/api/api'
import { convertNumberForClient } from 'utils/calcFunctions'
import { isAbortError } from 'errors/error'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { parseDate } from 'utils/time'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { ProposalRecordType } from 'providers/ProposalsProvider/helpers/proposals.types'
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import { VotingTypes } from 'app/App.components/VotingArea/helpers/voting.const'

// componets
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Info } from 'app/App.components/Info/Info.view'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from 'app/App.components/Table'
import { VotingProposalsArea } from 'app/App.components/VotingArea/VotingArea.controller'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { ProposalDetailsStyled } from './ProposalDetails.style'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { getTooltipForStatus } from 'pages/Governance/helpers/governanceView.helpers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// consts
import {
  DROP_PROPOSAL_ACTION,
  EXECUTE_PROPOSAL_ACTION,
  GovPhases,
  PROCESS_PROPOSAL_ACTION,
  PROPOSAL_ROUND_VOTE_ACTION,
  ProposalStatus,
  VOTING_ROUND_VOTE_ACTION,
} from 'providers/ProposalsProvider/helpers/proposals.const'

// actions
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'providers/ProposalsProvider/actions/proposals.actions'
import { dropProposal } from 'providers/ProposalsProvider/actions/proposalsSubmission.actions'

export const ProposalDetails = ({ proposal, isHistory }: { proposal: ProposalRecordType; isHistory: boolean }) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    config: { governancePhase },
  } = useProposalsContext()
  const {
    preferences: { themeSelected },
    contractAddresses: { governanceAddress },
    globalLoadingState: { isActionActive },
    handleCopy,
  } = useDappConfigContext()
  const { tokensMetadata } = useTokensContext()

  const isUserOwnerIfTheProposal = proposal.proposerId === userAddress

  // User can drop proposal only if he is owner and proposal in newly created, or on voting stage
  const userCanDropProposal =
    isUserOwnerIfTheProposal &&
    (proposal.status === ProposalStatus.LOCKED ||
      proposal.status === ProposalStatus.ONGOING ||
      proposal.status === ProposalStatus.UNLOCKED)

  const isExecuteProposal = proposal.anyCanExecute && userAddress
  const isPaymentProposal = proposal.anyCanPay && userAddress

  // Actions
  /**
   * helper function for the current component actions
   * most of the actions have same parameters (governanceAddress, proposalId) and "if" conditions
   * to reduce the amount of code we call these actions with current function
   */
  const invokeActionWithIdenticalParameters = useCallback(
    async (
      actionFn: (
        governanceAddress: string,
        proposalId: number,
      ) => Promise<ActionErrorReturnType | ActionSuccessReturnType>,
    ) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceAddress) {
        bug('Wrong governance address')
        return null
      }

      return await actionFn(governanceAddress, Number(proposal.id))
    },
    [bug, governanceAddress, proposal.id, userAddress],
  )

  // drop proposal ------------------------------------------------------------------------
  const dropProposalContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DROP_PROPOSAL_ACTION,
      actionFn: invokeActionWithIdenticalParameters.bind(null, dropProposal),
    }),
    [invokeActionWithIdenticalParameters],
  )

  const { action: handleDeleteProposal } = useContractAction(dropProposalContractProps)

  // execute proposal ------------------------------------------------------------------------

  const executeProposalContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: EXECUTE_PROPOSAL_ACTION,
      actionFn: invokeActionWithIdenticalParameters.bind(null, executeProposal),
    }),
    [invokeActionWithIdenticalParameters],
  )

  const { action: handleClickExecuteProposal } = useContractAction(executeProposalContractProps)

  //  process proposal payment ---------------------------------------------------------------------------
  const processProposalPaymentContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROCESS_PROPOSAL_ACTION,
      actionFn: invokeActionWithIdenticalParameters.bind(null, processProposalPayment),
    }),
    [invokeActionWithIdenticalParameters],
  )

  const { action: handleClickProcessPayment } = useContractAction(processProposalPaymentContractProps)

  // proposal round vote action  ---------------------------------------------------------------------------
  const proposaRoundVoteContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROPOSAL_ROUND_VOTE_ACTION,
      actionFn: invokeActionWithIdenticalParameters.bind(null, proposalRoundVote),
    }),
    [invokeActionWithIdenticalParameters],
  )

  const { action: handleProposalRoundVote } = useContractAction(proposaRoundVoteContractProps)

  // handleVotingRoundVote action ---------------------------------------------------------------------------
  const votingRoundVoteActionFn = useCallback(
    async (vote: VotingTypes) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceAddress) {
        bug('Wrong governance address')
        return null
      }

      return await votingRoundVote(governanceAddress, vote)
    },
    [bug, governanceAddress, userAddress],
  )

  // @ts-ignore
  const handleVotingRoundContractProps: HookContractActionArgs<VotingTypes> = useMemo(
    () => ({
      actionType: VOTING_ROUND_VOTE_ACTION,
      actionFn: votingRoundVoteActionFn,
    }),
    [votingRoundVoteActionFn],
  )

  const { actionWithArgs: handleVotingRoundVote } = useContractAction<VotingTypes>(handleVotingRoundContractProps)

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
    const { droppedTime, currentCycleEndLevel, executionTime, executed } = proposal
    if (droppedTime) {
      setVotingTill(new Date(droppedTime).getTime())
      return
    }

    if (executionTime && executed) {
      setVotingTill(new Date(executionTime).getTime())
      return
    }

    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(currentCycleEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )
        setVotingTill(new Date(votingEndTimestamp).getTime())
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
          bug('Unexpected error happened occured, please reload the page')
        }
        return
      }
    })()

    return () => abortController.abort()
  }, [proposal])

  // store bytes that are opened
  const [openedBytes, setOpenedBytes] = useState<Array<number>>([])

  const statusTooltipText = getTooltipForStatus(proposal.status)

  return (
    <ProposalDetailsStyled isAuthorized={Boolean(userAddress)}>
      <div className="title-status">
        <H2Title>{proposal.title}</H2Title>
        <StatusFlag text={proposal.status} status={proposal.status} />
        {statusTooltipText ? (
          <CustomTooltip
            className="tooltip"
            text={statusTooltipText}
            iconId="info"
            defaultStrokeColor={colors[themeSelected].subHeadingText}
          />
        ) : null}
      </div>

      {isHistory &&
      ((proposal.executionTime && proposal.executed) ||
        proposal.defeatedTime ||
        (proposal.droppedTime && proposal.status === ProposalStatus.DROPPED)) ? (
        <div className="voting-ends">
          {proposal.executionTime && proposal.executed
            ? `Proposal was executed on ${parseDate({
                time: proposal.executionTime,
                timeFormat: 'MMMM Do HH:mm Z',
              })} CEST`
            : proposal.droppedTime && proposal.status === ProposalStatus.DROPPED
            ? `Proposal was dropped on ${parseDate({
                time: proposal.droppedTime,
                timeFormat: 'MMMM Do HH:mm Z',
              })} CEST`
            : `Proposal was defeated on ${parseDate({
                time: proposal.defeatedTime,
                timeFormat: 'MMMM Do HH:mm Z',
              })} CEST`}
        </div>
      ) : null}

      {votingTill && !isHistory ? (
        <div className="voting-ends">
          {votingTill <= Date.now()
            ? `Voting has ended on ${parseDate({ time: votingTill, timeFormat: 'MMMM Do HH:mm Z' })} CEST`
            : `Voting ending on ${parseDate({ time: votingTill, timeFormat: 'MMMM Do HH:mm Z' })} CEST`}
        </div>
      ) : null}

      {proposal.status === ProposalStatus.UNLOCKED ? (
        <Info
          type={INFO_DEFAULT}
          text={
            isUserOwnerIfTheProposal
              ? 'Your proposal isn’t locked yet and can’t be voted on. You can lock it on the proposal submission page.'
              : 'This proposal hasn’t be locked yet for voting. The proposer is currently working on the proposal and fine-tuning it. It will be available to vote on in the near future.'
          }
        />
      ) : null}

      <VotingProposalsArea
        voteStatistics={voteStatistics}
        votingPhaseHandler={handleVotingRoundVote}
        handleProposalVote={handleProposalRoundVote}
        selectedProposal={proposal}
        vote={proposal.votes.find(
          ({ address, round }) =>
            address === userAddress &&
            round === (governancePhase === GovPhases.PROPOSAL || governancePhase === GovPhases.EXECUTION ? 0 : 1),
        )}
        isVoteActive={
          proposal.status === ProposalStatus.LOCKED || proposal.status === ProposalStatus.ONGOING
            ? (votingTill ?? 0) >= Date.now()
            : false
        }
        govPhase={governancePhase}
      />

      {isExecuteProposal || isPaymentProposal ? (
        <div className="proposal-button-action">
          {isExecuteProposal ? (
            <Button onClick={handleClickExecuteProposal} disabled={isActionActive} kind={BUTTON_PRIMARY}>
              Execute Proposal
            </Button>
          ) : null}
          {isPaymentProposal ? (
            <Button onClick={handleClickProcessPayment} disabled={isActionActive} kind={BUTTON_PRIMARY}>
              Process Payment
            </Button>
          ) : null}
        </div>
      ) : null}

      <hr />

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Description</div>
        <div className="proposal-data-block-value">{proposal.description}</div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Source Code</div>
        <div className="proposal-data-block-value">
          {proposal.sourceCode ? (
            <a href={proposal.sourceCode} target="_blank" rel="noreferrer">
              {proposal.sourceCode}
            </a>
          ) : (
            <div className="proposal-data-block-no-value">No link to source code given</div>
          )}
        </div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Invoice</div>
        <div className="proposal-data-block-value">
          {proposal.invoice ? (
            <a href={proposal.invoice} target="_blank" rel="noreferrer">
              {proposal.invoice}
            </a>
          ) : (
            <span className="proposal-data-block-no-value">No link for an invoice given</span>
          )}
        </div>
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Meta-Data</div>
        {proposal.proposalData?.length ? (
          <ul className="bytes-list">
            {proposal.proposalData.map((item, idx) => {
              if (!item || typeof item.title !== 'string' || typeof item.encoded_code !== 'string') return null

              const isByteOpened = openedBytes.includes(item.id)
              const byteText = item.encoded_code
              return (
                <li key={item.id}>
                  <div className="byte-text-wrapper" style={{ alignItems: 'center' }}>
                    <div className="title" style={{ marginRight: '5px' }}>
                      {idx + 1}. Title:
                    </div>
                    <div className="proposal-data-block-value title-main">{item?.title || '–'}</div>
                  </div>
                  <div className="byte-text-wrapper">
                    <div className="proposal-data-block-value proposal-data-block-desc">
                      <span className="title" style={{ marginRight: '5px' }}>
                        Description:
                      </span>
                      {item.code_description || '–'}
                    </div>
                  </div>

                  <div className={`byte ${isByteOpened ? 'opened' : ''}`}>
                    <div className="title" style={{ marginRight: '5px' }}>
                      Bytes:
                    </div>

                    <div className={`byte-content`}>
                      <div className="byte-text" onClick={isByteOpened ? () => handleCopy(byteText) : undefined}>
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
          </ul>
        ) : (
          <div className="proposal-data-block-value proposal-data-block-no-value">No proposal meta-data given</div>
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
                <TableHeaderCell className="right-border">Payment Type</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposal.proposalPayments.map((payment) => {
                if (
                  payment.to__id === null ||
                  payment.title === null ||
                  payment.token_address === null ||
                  payment.token_address === undefined
                )
                  return null

                const token = getTokenDataByAddress({ tokenAddress: payment.token_address, tokensMetadata })

                if (!token) return null

                const { symbol, decimals } = token
                const tokenAmount = convertNumberForClient({ number: Number(payment.token_amount), grade: decimals })

                return (
                  <TableRow className="editable-row proposal-details-payments" key={payment.id}>
                    <TableCell width="25%">
                      <TzAddress tzAddress={String(payment.to__id)} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon={false} />
                    </TableCell>
                    <TableCell width="25%">{String(payment.title)}</TableCell>
                    <TableCell width="25%">
                      <CommaNumber value={tokenAmount} decimalsToShow={decimals} endingText={symbol} />
                    </TableCell>
                    <TableCell className="no-right-border" width="25%">
                      {symbol}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="proposal-data-block-value proposal-data-block-no-value">No payment data given</div>
        )}
      </div>

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Proposer</div>
        <div className="proposal-data-block-value proposal-data-block-address">
          <TzAddress tzAddress={proposal.proposerId} type={PRIMARY_TZ_ADDRESS_COLOR} isBold />
        </div>
      </div>

      <hr />

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Governance Info</div>
        <div className="gov-data">
          <div className="proposal-data-block-name">Governance Contract</div>
          <div className="proposal-data-block-value proposal-data-block-address">
            <TzAddress tzAddress={proposal.governanceId} type={PRIMARY_TZ_ADDRESS_COLOR} isBold />
          </div>
        </div>
      </div>

      {isUserOwnerIfTheProposal && !isHistory ? (
        <div className="drop-proposal">
          <Button kind={BUTTON_SECONDARY} onClick={handleDeleteProposal} disabled={!userCanDropProposal}>
            <Icon id="navigation-menu_close" />
            Drop Proposal
          </Button>
        </div>
      ) : null}
    </ProposalDetailsStyled>
  )
}
