import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { Tooltip } from '../Tooltip/Tooltip'
import { VotingBarProps } from './helpers/voting'
import {
  QuorumBar,
  UnusedVote,
  VotingBarStyled,
  VotingContainer,
  VotingNay,
  VotingPass,
  VotingYay,
} from './VotingBar.style'

export const VotingBar = ({
  voteStatistics: { yayVotesMvnTotal, nayVotesMvnTotal, passVotesMvnTotal, unusedVotesMvnTotal, quorum },
  quorumText = 'Quorum',
}: VotingBarProps) => {
  const totalVotes = yayVotesMvnTotal + (nayVotesMvnTotal ?? 0) + (passVotesMvnTotal ?? 0) + unusedVotesMvnTotal

  let yayVotesWidth = (yayVotesMvnTotal / totalVotes) * 100
  let nayVotesWidth = ((nayVotesMvnTotal ?? 0) / totalVotes) * 100
  let passVotesWidth = ((passVotesMvnTotal ?? 0) / totalVotes) * 100
  let unusedVotesWidth = (unusedVotesMvnTotal / totalVotes) * 100

  if (totalVotes === 0) {
    const averagePercent =
      100 /
      ((yayVotesMvnTotal === undefined ? 0 : 1) +
        (nayVotesMvnTotal === undefined ? 0 : 1) +
        (passVotesMvnTotal === undefined ? 0 : 1) +
        (unusedVotesMvnTotal === undefined ? 0 : 1))

    yayVotesWidth = averagePercent
    nayVotesWidth = averagePercent
    passVotesWidth = averagePercent
    unusedVotesWidth = averagePercent
  }

  return (
    <VotingContainer>
      <QuorumBar $width={quorum}>
        <div className="text">
          {quorumText} <b>{quorum}%</b>
        </div>
      </QuorumBar>
      <VotingBarStyled>
        <VotingYay $width={yayVotesWidth}>
          <Tooltip>
            <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
            <Tooltip.Content className="voting-tooltip-content">
              <CommaNumber value={+yayVotesMvnTotal.toFixed(0)} /> &nbsp; yay votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+yayVotesMvnTotal.toFixed(0)} />
        </VotingYay>

        {passVotesMvnTotal !== undefined ? (
          <VotingPass $width={passVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+passVotesMvnTotal.toFixed(0)} /> &nbsp; abstention votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+passVotesMvnTotal.toFixed(0)} />
          </VotingPass>
        ) : null}

        <UnusedVote $width={unusedVotesWidth}>
          <Tooltip>
            <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
            <Tooltip.Content className="voting-tooltip-content">
              <CommaNumber value={+unusedVotesMvnTotal.toFixed(0)} /> &nbsp; unused votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+unusedVotesMvnTotal.toFixed(0)} />
        </UnusedVote>

        {nayVotesMvnTotal !== undefined ? (
          <VotingNay $width={nayVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+nayVotesWidth.toFixed(0)} /> &nbsp; nay votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+nayVotesMvnTotal.toFixed(0)} />
          </VotingNay>
        ) : null}
      </VotingBarStyled>
    </VotingContainer>
  )
}
