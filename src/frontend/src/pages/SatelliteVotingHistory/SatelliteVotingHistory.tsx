import { SatelliteVotesType } from 'providers/SatellitesProvider/satellites.provider.types'
import { SatelliteVotingHistoryListItem } from './SatelliteVotingHistory.style'
import { parseDate } from 'utils/time'
import { SATELLITE_VOTES_MAPPER } from 'providers/SatellitesProvider/satellites.const'

export const SatellitesVotingHistory = ({
  satelliteVotes: { proposalsVotes, satelliteActionVotes, financialRequestsVotes },
}: {
  satelliteVotes: SatelliteVotesType
}) => {
  const hasVoted = proposalsVotes.length || satelliteActionVotes.length || financialRequestsVotes.length

  if (!hasVoted)
    return (
      <div className="voting-info-list-wrapper scroll-block">
        <SatelliteVotingHistoryListItem>
          <p>No voting history available</p>
        </SatelliteVotingHistoryListItem>
      </div>
    )

  const allVotes = [...proposalsVotes, ...satelliteActionVotes, ...financialRequestsVotes]
  return (
    <div className="voting-info-list-wrapper scroll-block">
      {allVotes.map(({ vote, id, voteName, timestamp }) => {
        const voteText = SATELLITE_VOTES_MAPPER[vote]
        const votedItemName = voteName.split('_').join(' ').toLowerCase()

        return (
          <SatelliteVotingHistoryListItem key={`${voteName}_${id}`}>
            <p>{votedItemName}</p>
            <span className="current satellite-voting-history-info">
              Voted <b className={`voting-${voteText.toLowerCase()}`}>{voteText} </b>
              {timestamp ? `on ${parseDate({ time: timestamp, timeFormat: 'MMM Do, YYYY' })}` : null}
            </span>
          </SatelliteVotingHistoryListItem>
        )
      })}
    </div>
  )
}
