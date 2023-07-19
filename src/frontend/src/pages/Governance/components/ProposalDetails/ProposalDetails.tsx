import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import colors from 'styles/colors'

// helpers & actions
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import { parseDate } from 'utils/time'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { dropProposal } from 'providers/ProposalsProvider/actions/proposalsSubmission.actions'

// types
import { State } from 'reducers'
import { GovPhases, ProposalRecordType, ProposalStatus } from 'utils/TypesAndInterfaces/Governance'
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
import { TzAddress, handleCopyToClipboard } from 'app/App.components/TzAddress/TzAddress.view'
import { getTooltipForStatus } from 'pages/Governance/helpers/governanceView.helpers'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { convertNumberForClient } from 'utils/calcFunctions'
import { api } from 'utils/api/api'
import { isAbortError } from 'errors/error'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import {
  DROP_PROPOSAL_ACTION,
  EXECUTE_PROPOSAL_ACTION,
  PROCESS_PROPOSAL_ACTION,
  PROPOSAL_ROUND_VOTE_ACTION,
  VOTING_ROUND_VOTE_ACTION,
} from 'providers/ProposalsProvider/helpers/proposals.const'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'providers/ProposalsProvider/actions/proposals.actions'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

export const ProposalDetails = ({ proposal }: { proposal: ProposalRecordType }) => {
  const dispatch = useDispatch()

  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()

  const { governancePhase } = useSelector((state: State) => state.governance.config)
  const {
    preferences: { themeSelected },
    contractAddresses: { governanceAddress },
    globalLoadingState: { isActionActive },
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

  // Proposal actions
  // const handleDeleteProposal = async () => await dispatch(dropProposal(proposal.id))
  // const handleClickExecuteProposal = async () => await dispatch(executeProposal(proposal.id))
  // const handleClickProcessPayment = async () => await dispatch(processProposalPayment(proposal.id))
  // const handleProposalRoundVote = async (proposalId: number) => await dispatch(proposalRoundVote(proposalId))
  // const handleVotingRoundVote = async (vote: `${VotingTypes}`) => await dispatch(votingRoundVote(vote))

  // Actions

  // this callback is similar to all action down here
  const dappActionCallback = useCallback(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  // action fn helper cuz params are identical -----------------------------------------------------------------
  const executeActionFn = useCallback(
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
      actionFn: executeActionFn.bind(null, dropProposal),
      dappActionCallback: dappActionCallback,
    }),
    [executeActionFn, dappActionCallback],
  )

  const handleDeleteProposal = useContractAction(dropProposalContractProps)

  // execute proposal ------------------------------------------------------------------------

  const executeProposalContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: EXECUTE_PROPOSAL_ACTION,
      actionFn: executeActionFn.bind(null, executeProposal),
      dappActionCallback,
    }),
    [executeActionFn, dappActionCallback],
  )

  const handleClickExecuteProposal = useContractAction(executeProposalContractProps)

  //  process proposal payment ---------------------------------------------------------------------------
  const processProposalPaymentContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROCESS_PROPOSAL_ACTION,
      actionFn: executeActionFn.bind(null, processProposalPayment),
      dappActionCallback,
    }),
    [executeActionFn, dappActionCallback],
  )

  const handleClickProcessPayment = useContractAction(processProposalPaymentContractProps)

  // propocal round vote action  ---------------------------------------------------------------------------
  const proposaRoundVoteContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROPOSAL_ROUND_VOTE_ACTION,
      actionFn: executeActionFn.bind(null, proposalRoundVote),
      dappActionCallback,
    }),
    [executeActionFn, dappActionCallback],
  )

  const handleProposalRoundVote = useContractAction(proposaRoundVoteContractProps)

  // TODO add VOTE types to fn args
  // handleVotingRoundVote action ---------------------------------------------------------------------------
  const handleVotingRoundContractProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: VOTING_ROUND_VOTE_ACTION,
      actionFn: executeActionFn.bind(null, votingRoundVote),
      dappActionCallback,
    }),
    [executeActionFn, dappActionCallback],
  )

  const handleVotingRoundVote = useContractAction(handleVotingRoundContractProps)

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
    const abortController = new AbortController()

    ;(async () => {
      try {
        const { data: votingEndTimestamp } = await api(
          getTimestampByLevelUrl(proposal.currentCycleEndLevel),
          { signal: abortController.signal, headers: getTimestampByLevelHeaders },
          getTimestampByLevelSchema,
        )
        setVotingTill(new Date(votingEndTimestamp).getTime())
      } catch (e) {
        // TODO: handle fetch errors when error boundary will be ready
        if (!isAbortError(e)) {
          console.error('getting timestamp by lvl error: ', e)
        }
        bug('Unexpected error happened occured, please reload the page')
      }
    })()

    return () => abortController.abort()
  }, [proposal.currentCycleEndLevel])

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
            defaultStrokeColor={colors[themeSelected]['textColor']}
          />
        ) : null}
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
          ({ address, round }) => address === userAddress && round === (governancePhase === GovPhases.PROPOSAL ? 0 : 1),
        )}
        isVoteActive={(votingTill ?? 0) >= Date.now()}
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
            <a href={proposal.sourceCode} target="_blank" rel="noreferrer" className="isCyan">
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
            <a href={proposal.invoice} target="_blank" rel="noreferrer" className="isCyan">
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
                <TableHeaderCell className="right-border">Payment Type (XTZ/MVK)</TableHeaderCell>
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
                      <TzAddress tzAddress={String(payment.to__id)} type={BLUE} hasIcon={false} />
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
          <TzAddress tzAddress={proposal.proposerId} type={BLUE} isBold />
        </div>
      </div>

      <hr />

      <div className="proposal-data-block-wrapper">
        <div className="proposal-data-block-name">Governance Info</div>
        <div className="gov-data">
          <div className="proposal-data-block-name">Governance Contract</div>
          <div className="proposal-data-block-value proposal-data-block-address">
            <TzAddress tzAddress={proposal.governanceId} type={BLUE} isBold />
          </div>
        </div>
      </div>

      {isUserOwnerIfTheProposal ? (
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
