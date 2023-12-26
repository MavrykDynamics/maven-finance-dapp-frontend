import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { Tooltip } from '../Tooltip/Tooltip'
import { VotingBarProps } from './helpers/voting'
import {
  NotYetVoted,
  QuorumBar,
  VotingAbstention,
  VotingAgainst,
  VotingBarStyled,
  VotingContainer,
  VotingFor,
} from './VotingBar.style'

export const VotingBar = ({
  voteStatistics: { forVotesMVNTotal, againstVotesMVNTotal, abstainVotesMVNTotal, unusedVotesMVNTotal, quorum },
  quorumText = 'Quorum',
}: VotingBarProps) => {
  const totalVotes = forVotesMVNTotal + (againstVotesMVNTotal ?? 0) + (abstainVotesMVNTotal ?? 0) + unusedVotesMVNTotal

  let forVotesWidth = (forVotesMVNTotal / totalVotes) * 100
  let againstVotesWidth = ((againstVotesMVNTotal ?? 0) / totalVotes) * 100
  let abstainingVotesWidth = ((abstainVotesMVNTotal ?? 0) / totalVotes) * 100
  let unusedVotesWidth = (unusedVotesMVNTotal / totalVotes) * 100

  if (totalVotes === 0) {
    const averagePersent =
      100 /
      ((forVotesMVNTotal === undefined ? 0 : 1) +
        (againstVotesMVNTotal === undefined ? 0 : 1) +
        (abstainVotesMVNTotal === undefined ? 0 : 1) +
        (unusedVotesMVNTotal === undefined ? 0 : 1))

    forVotesWidth = averagePersent
    againstVotesWidth = averagePersent
    abstainingVotesWidth = averagePersent
    unusedVotesWidth = averagePersent
  }

  return (
    <VotingContainer>
      <QuorumBar width={quorum}>
        <div className="text">
          {quorumText} <b>{quorum}%</b>
        </div>
      </QuorumBar>
      <VotingBarStyled>
        <VotingFor width={forVotesWidth}>
          <Tooltip>
            <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
            <Tooltip.Content className="voting-tooltip-content">
              <CommaNumber value={+forVotesMVNTotal.toFixed(0)} /> &nbsp; yay votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+forVotesMVNTotal.toFixed(0)} />
        </VotingFor>

        {abstainVotesMVNTotal !== undefined ? (
          <VotingAbstention width={abstainingVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+abstainVotesMVNTotal.toFixed(0)} /> &nbsp; abstention votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+abstainVotesMVNTotal.toFixed(0)} />
          </VotingAbstention>
        ) : null}

        <NotYetVoted width={unusedVotesWidth}>
          <Tooltip>
            <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
            <Tooltip.Content className="voting-tooltip-content">
              <CommaNumber value={+unusedVotesMVNTotal.toFixed(0)} /> &nbsp; unused votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+unusedVotesMVNTotal.toFixed(0)} />
        </NotYetVoted>

        {againstVotesMVNTotal !== undefined ? (
          <VotingAgainst width={againstVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+againstVotesWidth.toFixed(0)} /> &nbsp; nay votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+againstVotesMVNTotal.toFixed(0)} />
          </VotingAgainst>
        ) : null}
      </VotingBarStyled>
    </VotingContainer>
  )
}
