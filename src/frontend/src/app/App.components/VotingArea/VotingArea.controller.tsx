import { useSelector } from 'react-redux'

// types, constants, helpers
import { State } from 'reducers'
import { VotingProposalsProps, VotingProps } from './helpers/voting'
import { VotingTypes, VoteList } from './helpers/voting.const'
import { VOTING_AGAINST, BUTTON_PRIMARY, VOTING_FOR, VOTING_PASS, BUTTON_WIDE } from '../Button/Button.constants'

// styles
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'

// view
import { VotingBar } from './VotingBar.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import ConnectWalletBtn from '../ConnectWallet/ConnectWalletBtn'
import Button from '../Button/NewButton'
import { GovPhases } from 'utils/TypesAndInterfaces/Governance'

type VotingType = VotingProps & {
  className?: string
  disableButtonByVote?: number
}

export const VotingArea = ({
  showVotingButtons = true,
  disableVotingButtons = false,
  handleVote,
  isVotingActive,
  quorumText,
  voteStatistics,
  className,
  buttonsToShow,
  disableButtonByVote,
}: VotingType) => {
  const { forBtn, againsBtn, passBtn } = buttonsToShow ?? { forBtn: {}, againsBtn: {}, passBtn: {} }
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const votingButtons = accountPkh ? (
    isSatellite && handleVote ? (
      <VotingButtonsContainer className="voting-buttons-wrapper">
        {forBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.YES)}
            kind={VOTING_FOR}
            form={BUTTON_WIDE}
            disabled={disableVotingButtons || isActionActive || disableButtonByVote === VoteList.YES}
          >
            {forBtn.text ?? 'Vote YES'}
          </Button>
        )}
        {passBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.PASS)}
            kind={VOTING_PASS}
            form={BUTTON_WIDE}
            disabled={disableVotingButtons || isActionActive || disableButtonByVote === VoteList.PASS}
          >
            {passBtn.text ?? 'Vote PASS'}
          </Button>
        )}
        {againsBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.NO)}
            kind={VOTING_AGAINST}
            form={BUTTON_WIDE}
            disabled={disableVotingButtons || isActionActive || disableButtonByVote === VoteList.NO}
          >
            {againsBtn.text ?? 'Vote NO'}
          </Button>
        )}
      </VotingButtonsContainer>
    ) : null
  ) : (
    <ConnectWalletBtn />
  )

  return (
    <VotingAreaStyled className={className}>
      <VotingBar voteStatistics={voteStatistics} quorumText={quorumText} />
      {isVotingActive && showVotingButtons ? votingButtons : null}
    </VotingAreaStyled>
  )
}

type VotingProposalsType = VotingProposalsProps & {
  className?: string
}

export const VotingProposalsArea = ({
  selectedProposal,
  govPhase,
  vote,
  voteStatistics,
  className,
  handleProposalVote,
  votingPhaseHandler,
}: VotingProposalsType) => {
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  // Proposal isn't locked, can't vote
  if (!selectedProposal.locked) return null

  // Proposal is locked and phase is proposal, (phase we can only vote yes, and most voted go to the next phase)
  if (selectedProposal.locked && govPhase === GovPhases.PROPOSAL) {
    return (
      <VotingAreaStyled className={className}>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.passVotesMVKTotal ?? 0} endingText={'voted MVK'} />
          {accountPkh ? (
            <Button
              onClick={() => handleProposalVote(Number(selectedProposal.id))}
              kind={BUTTON_PRIMARY}
              disabled={vote?.round === 0 || !isSatellite || isActionActive}
            >
              Vote for this Proposal
            </Button>
          ) : (
            <ConnectWalletBtn />
          )}
        </div>
      </VotingAreaStyled>
    )
  }

  // stage voting, user can vote, yes, no, pass
  if (govPhase === GovPhases.VOTING) {
    return (
      <VotingArea
        voteStatistics={voteStatistics}
        isVotingActive={true}
        handleVote={votingPhaseHandler}
        disableVotingButtons={vote?.round === 1}
      />
    )
  }

  // on timelock phase show only voting bar, witout voting buttons
  return <VotingBar voteStatistics={voteStatistics} />
}
