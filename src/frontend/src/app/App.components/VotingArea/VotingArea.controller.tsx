import { useSelector } from 'react-redux'

// types, constants, helpers
import { State } from 'reducers'
import { VotingProposalsProps, VotingProps } from './helpers/voting'
import { VotingTypes } from './helpers/voting.const'
import { VOTING_AGAINST, BUTTON_PRIMARY, VOTING_FOR, VOTING_PASS, BUTTON_WIDE } from '../Button/Button.constants'

// styles
import { VotingAreaStyled, VotingButtonsContainer } from './VotingArea.style'

// view
import { VotingBar } from './VotingBar.controller'
import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { ConnectWallet } from '../ConnectWallet/ConnectWallet.controller'
import Button from '../Button/NewButton'

type VotingType = VotingProps & {
  className?: string
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
            disabled={disableVotingButtons || isActionActive}
          >
            {forBtn.text ?? 'Vote YES'}
          </Button>
        )}
        {passBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.PASS)}
            kind={VOTING_PASS}
            form={BUTTON_WIDE}
            disabled={disableVotingButtons || isActionActive}
          >
            {passBtn.text ?? 'Vote PASS'}
          </Button>
        )}
        {againsBtn && (
          <Button
            onClick={() => handleVote(VotingTypes.NO)}
            kind={VOTING_AGAINST}
            form={BUTTON_WIDE}
            disabled={disableVotingButtons || isActionActive}
          >
            {againsBtn.text ?? 'Vote NO'}
          </Button>
        )}
      </VotingButtonsContainer>
    ) : null
  ) : (
    <ConnectWallet />
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
  vote,
  handleProposalVote,
  voteStatistics,
  shownBlock,
  votingPhaseHandler,
  className,
}: VotingProposalsType) => {
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const { isActionActive } = useSelector((state: State) => state.loading)

  if (shownBlock === 'bar') {
    return <VotingBar voteStatistics={voteStatistics} />
  }

  if (shownBlock === 'area') {
    return (
      <VotingArea
        voteStatistics={voteStatistics}
        isVotingActive={true}
        handleVote={votingPhaseHandler}
        disableVotingButtons={vote?.round === 1}
      />
    )
  }

  if (shownBlock === 'proposalRoundVote') {
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
            <ConnectWallet />
          )}
        </div>
      </VotingAreaStyled>
    )
  }

  return null
}
