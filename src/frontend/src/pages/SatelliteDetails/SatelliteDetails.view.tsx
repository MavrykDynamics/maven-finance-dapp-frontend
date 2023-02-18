import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { State } from 'reducers'
import { Page } from 'styles'
import { ClockLoader, SpinnerLoader } from 'app/App.components/Loader/Loader.view'
import type { SatelliteVotingDataType } from '../../utils/TypesAndInterfaces/Satellites'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Satellites'
import SatellitePagination from '../Satellites/SatellitePagination/SatellitePagination.view'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'

// style
import {
  BlockName,
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  SatelliteMetricsBlock,
  SatelliteVotingHistoryListItem,
  SatelliteVotingInfoWrapper,
} from './SatelliteDetails.style'
import { EmptyContainer } from '../../app/App.style'
import { SatelliteListItem } from 'pages/Satellites/SatelliteList/ListCards/SateliteCard.view'
import { UserSatelliteRewardsData } from 'utils/TypesAndInterfaces/User'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { parseDate } from 'utils/time'
import { PageContent } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getVoteText } from 'pages/Satellites/Satellites.normalizer'

type SatelliteDetailsViewProps = {
  satellite: SatelliteRecord
  delegateCallback: (address: string) => void
  undelegateCallback: (address: string) => void
  claimRewardsCallback: () => void
  userStakedBalanceInSatellite: number
  userSatelliteReward?: UserSatelliteRewardsData
  satelliteMetrics: {
    proposalParticipation: number
    votingPartisipation: number
    oracleEfficiency: number
  }
}

const renderVotingHistoryItem = (item: SatelliteVotingDataType) => {
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

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No satellite data</figcaption>
  </EmptyContainer>
)

export const SatelliteDetailsView = ({
  satellite,
  delegateCallback,
  undelegateCallback,
  claimRewardsCallback,
  userStakedBalanceInSatellite: myDelegatedMVK,
  userSatelliteReward,
  satelliteMetrics,
}: SatelliteDetailsViewProps) => {
  const { satelliteId } = useParams<{ satelliteId: string }>()
  const {
    user: { satelliteMvkIsDelegatedTo },
  } = useSelector((state: State) => state.wallet)
  const isSameId = satellite?.address === satelliteId
  const isSatellite = satellite && satellite.address && satellite.address !== 'None'

  // TODO: add loader on fetching specific satellite
  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent>
        <div>
          <SatellitePagination />
          {!isSameId ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellite info</div>
            </DataLoaderWrapper>
          ) : isSatellite ? (
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
                      <CommaNumber value={satelliteMetrics.proposalParticipation} endingText="%" showDecimal={false} />
                    </p>
                    <h5>Vote Participation</h5>
                    <p>
                      <CommaNumber value={satelliteMetrics.votingPartisipation} endingText="%" showDecimal={false} />
                    </p>
                    <h5>Oracle Participation</h5>
                    <p>
                      <CommaNumber value={satelliteMetrics.oracleEfficiency} endingText="%" showDecimal={false} />
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
          ) : (
            emptyContainer
          )}
        </div>

        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}
