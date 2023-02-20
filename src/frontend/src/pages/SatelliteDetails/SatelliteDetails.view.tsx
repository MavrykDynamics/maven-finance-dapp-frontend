import { useSelector } from 'react-redux'

import { parseDate } from 'utils/time'
import { SatelliteRecordType, SatelliteVoteType } from 'utils/TypesAndInterfaces/Satellites'
import { getVoteText } from 'pages/Satellites/helpers/Satellites.consts'
import { UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { State } from 'reducers'

// view
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// style
import {
  BlockName,
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  SatelliteMetricsBlock,
  SatelliteVotingHistoryListItem,
  SatelliteVotingInfoWrapper,
} from './SatelliteDetails.style'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecordType
  delegateCallback: (address: string) => void
  undelegateCallback: (address: string) => void
  claimRewardsCallback: () => void
  userStakedBalanceInSatellite: number
  userSatelliteReward?: UserSatelliteRewardsData
}

const renderVotingHistoryItem = (item: SatelliteVoteType) => {
  const voteText = getVoteText(item.vote)
  return (
    <SatelliteVotingHistoryListItem key={item.id}>
      <p>{item?.voteName?.split('_').join(' ').toLowerCase()}</p>
      <span className="satellite-voting-history-info">
        Voted <b className={`voting-${voteText.toLowerCase()}`}>{voteText} </b>
        {item.timestamp
          ? `on ${parseDate({ time: new Date(item.timestamp).getTime(), timeFormat: 'MMM Do, YYYY' })}`
          : null}
      </span>
    </SatelliteVotingHistoryListItem>
  )
}

export const SatelliteDetailsView = ({
  satellite,
  delegateCallback,
  undelegateCallback,
  claimRewardsCallback,
  userStakedBalanceInSatellite: myDelegatedMVK,
  userSatelliteReward,
}: SatelliteDetailsViewProps) => {
  const {
    user: { satelliteMvkIsDelegatedTo },
  } = useSelector((state: State) => state.wallet)

  return (
    <SatelliteListItem
      satellite={satellite}
      delegateCallback={delegateCallback}
      undelegateCallback={undelegateCallback}
      claimRewardsCallback={claimRewardsCallback}
      userStakedBalance={myDelegatedMVK}
      satelliteUserIsDelegatedTo={satelliteMvkIsDelegatedTo}
      isDetailsPage={true}
      userHasSatelliteRewards={(userSatelliteReward?.myAvailableSatelliteRewards ?? 0) > 0}
    >
      <SatelliteCardBottomRow>
        <SatelliteDescrBlock>
          <BlockName>Description</BlockName>
          <p className="descr">{satellite.description}</p>
          {satellite.website ? (
            <a className="satellite-website" href={satellite.website} target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
        </SatelliteDescrBlock>

        <div>
          <BlockName>Satellite metrics</BlockName>
          <SatelliteMetricsBlock>
            <h5>Proposal Participation</h5>
            <p>
              <CommaNumber
                value={satellite.satelliteMetrics.proposalParticipation}
                endingText="%"
                showDecimal={false}
              />
            </p>
            <h5>Vote Participation</h5>
            <p>
              <CommaNumber value={satellite.satelliteMetrics.votingPartisipation} endingText="%" showDecimal={false} />
            </p>
            <h5>Oracle Participation</h5>
            <p>
              <CommaNumber value={satellite.satelliteMetrics.oracleEfficiency} endingText="%" showDecimal={false} />
            </p>
          </SatelliteMetricsBlock>
        </div>

        <SatelliteVotingInfoWrapper>
          <BlockName>Voting History</BlockName>
          <div className="voting-info-list-wrapper scroll-block">
            {satellite.proposalVotingHistory?.map((item) => renderVotingHistoryItem(item))}
            {satellite.financialRequestsVotes?.map((item) => renderVotingHistoryItem(item))}
            {satellite.emergencyGovernanceVotes?.map((item) => renderVotingHistoryItem(item))}
            {satellite.satelliteActionVotes?.map((item) => renderVotingHistoryItem(item))}
            {!satellite.proposalVotingHistory?.length &&
              !satellite.satelliteActionVotes?.length &&
              !satellite.financialRequestsVotes?.length &&
              !satellite.emergencyGovernanceVotes?.length && (
                <SatelliteVotingHistoryListItem>
                  <p>No voting history available</p>
                </SatelliteVotingHistoryListItem>
              )}
          </div>
        </SatelliteVotingInfoWrapper>
      </SatelliteCardBottomRow>
    </SatelliteListItem>
  )
}
