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
import { GovPhases, ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { Info } from '../Info/Info.view'
import { INFO_DEFAULT } from '../Info/info.constants'
import { UNREGISTERED_SATELLITE_BANNER_TEXT } from 'texts/banners/satellite.text'

type VotingType = VotingProps & {
  className?: string
  disableButtonByVote?: number
  currentVote?: ProposalRecordType['votes'][number]
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
  currentVote,
}: VotingType) => {
  const { forBtn, againsBtn, passBtn } = buttonsToShow ?? { forBtn: {}, againsBtn: {}, passBtn: {} }
  const {
    accountPkh,
    user: { isSatellite, isNewlyRegisteredSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const { current_round_vote, vote, round } = currentVote ?? {}

  const votingButtons = accountPkh ? (
    isSatellite && handleVote ? (
      <VotingButtonsContainer className="voting-buttons-wrapper">
        {forBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.YES)}
            kind={VOTING_FOR}
            form={BUTTON_WIDE}
            disabled={
              disableVotingButtons ||
              isActionActive ||
              disableButtonByVote === VoteList.YES ||
              isNewlyRegisteredSatellite ||
              (round === 1 && current_round_vote && vote === 1)
            }
          >
            {forBtn.text ?? 'Vote YES'}
          </Button>
        )}
        {passBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.PASS)}
            kind={VOTING_PASS}
            form={BUTTON_WIDE}
            disabled={
              disableVotingButtons ||
              isActionActive ||
              disableButtonByVote === VoteList.PASS ||
              isNewlyRegisteredSatellite ||
              (round === 1 && current_round_vote && vote === 0)
            }
          >
            {passBtn.text ?? 'Vote PASS'}
          </Button>
        )}
        {againsBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.NO)}
            kind={VOTING_AGAINST}
            form={BUTTON_WIDE}
            disabled={
              disableVotingButtons ||
              isActionActive ||
              disableButtonByVote === VoteList.NO ||
              isNewlyRegisteredSatellite ||
              (round === 1 && current_round_vote && vote === 2)
            }
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
  isVoteActive: boolean
}

export const VotingProposalsArea = ({
  selectedProposal,
  govPhase,
  isVoteActive,
  vote,
  voteStatistics,
  handleProposalVote,
  votingPhaseHandler,
}: VotingProposalsType) => {
  const {
    accountPkh,
    user: { isSatellite, isNewlyRegisteredSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  // Proposal isn't locked, can't vote
  if (!selectedProposal.locked) return null

  if (!isVoteActive) {
    if (
      selectedProposal.upvoteMvkTotal > 0 ||
      selectedProposal.abstainMvkTotal > 0 ||
      selectedProposal.downvoteMvkTotal > 0
    ) {
      return (
        <VotingAreaStyled>
          <div className="voted-bar">
            <VotingBar voteStatistics={voteStatistics} />
          </div>
        </VotingAreaStyled>
      )
    }

    if (selectedProposal.passVoteMvkTotal > 0) {
      return (
        <VotingAreaStyled>
          <div className="voted-block">
            <CommaNumber
              className="voted-label"
              value={voteStatistics.passVotesMVKTotal ?? 0}
              endingText={'voted MVK'}
            />
          </div>
        </VotingAreaStyled>
      )
    }

    return null
  }

  // Proposal is locked and phase is proposal, (phase we can only vote yes, and most voted go to the next phase)
  if (selectedProposal.locked && govPhase === GovPhases.PROPOSAL) {
    return (
      <VotingAreaStyled>
        <div className="voted-block">
          <CommaNumber className="voted-label" value={voteStatistics.passVotesMVKTotal ?? 0} endingText={'voted MVK'} />
          {isNewlyRegisteredSatellite && (
            <div className="banner-area">
              <Info text={UNREGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />
            </div>
          )}
          {accountPkh ? (
            <Button
              onClick={() => handleProposalVote(Number(selectedProposal.id))}
              kind={BUTTON_PRIMARY}
              disabled={vote?.round === 0 || !isSatellite || isActionActive || isNewlyRegisteredSatellite}
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
      <VotingArea voteStatistics={voteStatistics} isVotingActive handleVote={votingPhaseHandler} currentVote={vote} />
    )
  }

  return null
}
