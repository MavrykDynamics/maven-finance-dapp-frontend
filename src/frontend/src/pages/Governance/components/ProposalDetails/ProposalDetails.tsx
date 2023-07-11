import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_SIMPLE_SMALL } from 'app/App.components/Button/Button.constants'
import { INFO_DEFAULT } from 'app/App.components/Info/info.constants'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

// helpers & actions
import { VoteStatistics } from 'app/App.components/VotingArea/helpers/voting'
import { parseDate } from 'utils/time'
import {
  getTimestampByLevelHeaders,
  getTimestampByLevelSchema,
  getTimestampByLevelUrl,
} from 'utils/api/api-helpers/getTimestampByLevel'
import { dropProposal } from 'pages/ProposalSubmission/ProposalSubmission.actions'
import {
  executeProposal,
  processProposalPayment,
  proposalRoundVote,
  votingRoundVote,
} from 'pages/Governance/actions/Proposals.actions'

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
import colors from 'styles/colors'
import { api } from 'utils/api/api'
import { isAbortError } from 'errors/error'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

export const ProposalDetails = ({ proposal }: { proposal: ProposalRecordType }) => {
  const dispatch = useDispatch()

  const { bug } = useToasterContext()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const { whitelistTokens } = useSelector((state: State) => state.tokens)
  const { governancePhase } = useSelector((state: State) => state.governance.config)
  const { themeSelected } = useSelector((state: State) => state.preferences)

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
    <ProposalDetailsStyled isAuthorized={Boolean(accountPkh)}>
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
          ({ voter: { address }, round }) =>
            address === accountPkh && round === (governancePhase === GovPhases.PROPOSAL ? 0 : 1),
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
          <a href={proposal.sourceCode} target="_blank" rel="noreferrer" className="isCyan">
            {proposal.sourceCode}
          </a>
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
            'No link for an invoice given'
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
                    <div className="title" style={{ marginRight: '5px' }}>
                      Description:
                    </div>
                    <div className="proposal-data-block-value">{item.code_description || '–'}</div>
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
                if (payment.to__id === null || payment.title === null) return null

                const selectedSymbol =
                  whitelistTokens.find(({ address }) => address === payment.token_address)?.symbol?.toUpperCase() ??
                  whitelistTokens?.[0]?.symbol?.toUpperCase() ??
                  'MVK'

                return (
                  <TableRow className="editable-row proposal-details-payments" key={payment.id}>
                    <TableCell width="25%">
                      <TzAddress tzAddress={String(payment.to__id)} type={BLUE} hasIcon={false} />
                    </TableCell>
                    <TableCell width="25%">{String(payment.title)}</TableCell>
                    <TableCell width="25%">
                      <CommaNumber
                        value={Number(payment.token_amount)}
                        // TODO: add decimals of max asset decimals, and check design with large decimals amount
                        decimalsToShow={4}
                        endingText={selectedSymbol}
                      />
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
