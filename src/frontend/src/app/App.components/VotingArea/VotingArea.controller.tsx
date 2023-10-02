// types
import { VotingProposalsProps, VotingProps } from './helpers/voting'
import { VotingTypes, VoteList } from './helpers/voting.const'

// view
import { VotingBar } from './VotingBar.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import ConnectWalletBtn from '../ConnectWallet/ConnectWalletBtn'
import { Info } from '../Info/Info.view'
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'
import Button from '../Button/NewButton'

// consts
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { VOTING_AGAINST, BUTTON_PRIMARY, VOTING_FOR, VOTING_PASS, BUTTON_WIDE } from '../Button/Button.constants'
import { INFO_DEFAULT } from '../Info/info.constants'
import { NEWLY_REGISTERED_SATELLITE_BANNER_TEXT } from 'texts/banners/satellite.text'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

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

  const { userAddress, isSatellite, isNewlyRegisteredSatellite } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const votingButtons = userAddress ? (
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
              isNewlyRegisteredSatellite
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
              isNewlyRegisteredSatellite
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
              isNewlyRegisteredSatellite
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
  const { userAddress, isSatellite, isNewlyRegisteredSatellite } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  // Proposal isn't locked, can't vote
  if (!selectedProposal.locked) return null

  if (!isVoteActive) {
    // if we have voting round votes
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

    // if only proposal round votes
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
              <Info text={NEWLY_REGISTERED_SATELLITE_BANNER_TEXT} type={INFO_DEFAULT} />
            </div>
          )}
          {userAddress ? (
            <Button
              onClick={handleProposalVote}
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
      <VotingArea
        voteStatistics={voteStatistics}
        isVotingActive
        handleVote={votingPhaseHandler}
        disableButtonByVote={vote?.vote}
      />
    )
  }

  return null
}
