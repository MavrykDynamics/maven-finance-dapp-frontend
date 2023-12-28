// types
import { VotingProposalsProps, VotingProps } from './helpers/voting'
import { VoteList, VotingTypes } from './helpers/voting.const'

// view
import { VotingBar } from './VotingBar.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import ConnectWalletBtn from '../ConnectWallet/ConnectWalletBtn'
import { Info } from '../Info/Info.view'
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'
import Button from '../Button/NewButton'

// consts
import { GovPhases } from 'providers/ProposalsProvider/helpers/proposals.const'
import { BUTTON_PRIMARY, BUTTON_WIDE, VOTING_NAY, VOTING_PASS, VOTING_YAY } from '../Button/Button.constants'
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
  const { yayBtn, nayBtn, passBtn } = buttonsToShow ?? { yayBtn: {}, nayBtn: {}, passBtn: {} }

  const { userAddress, isSatellite, isNewlyRegisteredSatellite } = useUserContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const votingButtons = userAddress ? (
    isSatellite && handleVote ? (
      <VotingButtonsContainer className="voting-buttons-wrapper">
        {yayBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.YAY)}
            kind={VOTING_YAY}
            form={BUTTON_WIDE}
            disabled={
              disableVotingButtons ||
              isActionActive ||
              disableButtonByVote === VoteList.YAY ||
              isNewlyRegisteredSatellite
            }
          >
            {yayBtn.text ?? 'Vote YES'}
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
        {nayBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.NAY)}
            kind={VOTING_NAY}
            form={BUTTON_WIDE}
            disabled={
              disableVotingButtons ||
              isActionActive ||
              disableButtonByVote === VoteList.NAY ||
              isNewlyRegisteredSatellite
            }
          >
            {nayBtn.text ?? 'Vote NO'}
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
      selectedProposal.yayVotesMvnTotal > 0 ||
      selectedProposal.passVotesMvnTotal > 0 ||
      selectedProposal.nayVotesMvnTotal > 0
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
    if (selectedProposal.proposalUpVotesMvnTotal > 0) {
      return (
        <VotingAreaStyled>
          <div className="voted-block">
            <CommaNumber
              className="voted-label"
              value={voteStatistics.proposalUpVotesMvnTotal ?? 0}
              endingText={'voted MVN'}
            />
          </div>
        </VotingAreaStyled>
      )
    }

    return null
  }

  // Proposal is locked and phase is proposal, (phase we can only vote yes, and most voted go to the next phase)
  if (selectedProposal.locked && (govPhase === GovPhases.PROPOSAL || govPhase === GovPhases.EXECUTION)) {
    return (
      <VotingAreaStyled>
        <div className="voted-block">
          <CommaNumber
            className="voted-label"
            value={voteStatistics.proposalUpVotesMvnTotal ?? 0}
            endingText={'voted MVN'}
          />
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
