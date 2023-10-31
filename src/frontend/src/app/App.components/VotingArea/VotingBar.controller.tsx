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
  voteStatistics: { forVotesMVKTotal, againstVotesMVKTotal, abstainVotesMVKTotal, unusedVotesMVKTotal, quorum },
  quorumText = 'Quorum',
}: VotingBarProps) => {
  const totalVotes = forVotesMVKTotal + (againstVotesMVKTotal ?? 0) + (abstainVotesMVKTotal ?? 0) + unusedVotesMVKTotal

  let forVotesWidth = (forVotesMVKTotal / totalVotes) * 100
  let againstVotesWidth = ((againstVotesMVKTotal ?? 0) / totalVotes) * 100
  let abstainingVotesWidth = ((abstainVotesMVKTotal ?? 0) / totalVotes) * 100
  let unusedVotesWidth = (unusedVotesMVKTotal / totalVotes) * 100

  if (totalVotes === 0) {
    const averagePersent =
      100 /
      ((forVotesMVKTotal === undefined ? 0 : 1) +
        (againstVotesMVKTotal === undefined ? 0 : 1) +
        (abstainVotesMVKTotal === undefined ? 0 : 1) +
        (unusedVotesMVKTotal === undefined ? 0 : 1))

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
              <CommaNumber value={+forVotesMVKTotal.toFixed(0)} /> &nbsp; yay votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+forVotesMVKTotal.toFixed(0)} />
        </VotingFor>

        {abstainVotesMVKTotal !== undefined ? (
          <VotingAbstention width={abstainingVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+abstainVotesMVKTotal.toFixed(0)} /> &nbsp; abstention votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+abstainVotesMVKTotal.toFixed(0)} />
          </VotingAbstention>
        ) : null}

        <NotYetVoted width={unusedVotesWidth}>
          <Tooltip>
            <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
            <Tooltip.Content className="voting-tooltip-content">
              <CommaNumber value={+unusedVotesMVKTotal.toFixed(0)} /> &nbsp; unused votes
            </Tooltip.Content>
          </Tooltip>
          <CommaNumber value={+unusedVotesMVKTotal.toFixed(0)} />
        </NotYetVoted>

        {againstVotesMVKTotal !== undefined ? (
          <VotingAgainst width={againstVotesWidth}>
            <Tooltip>
              <Tooltip.Trigger className="voting-tooltip-trigger"></Tooltip.Trigger>
              <Tooltip.Content className="voting-tooltip-content">
                <CommaNumber value={+againstVotesWidth.toFixed(0)} /> &nbsp; nay votes
              </Tooltip.Content>
            </Tooltip>
            <CommaNumber value={+againstVotesMVKTotal.toFixed(0)} />
          </VotingAgainst>
        ) : null}
      </VotingBarStyled>
    </VotingContainer>
  )
}
