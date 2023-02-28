import { useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router-dom'

import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import SatellitePagination from './SatellitePagination/SatellitePagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'

import { getVoteText } from 'pages/Satellites/helpers/Satellites.consts'
import { parseDate } from 'utils/time'

import { State } from 'reducers'
import { SatelliteRecordType, SatelliteVoteType } from 'utils/TypesAndInterfaces/Satellites'

import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import {
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  BlockName,
  SatelliteMetricsBlock,
  SatelliteVotingInfoWrapper,
  SatelliteVotingHistoryListItem,
} from './SatelliteDetails.style'

const renderVotingHistoryItem = (item: SatelliteVoteType) => {
  const voteText = getVoteText(item.vote)
  return (
    <SatelliteVotingHistoryListItem key={item.id}>
      <p>{item?.voteName?.split('_').join(' ').toLowerCase()}</p>
      <span className="currentSatellite-voting-history-info">
        Voted <b className={`voting-${voteText.toLowerCase()}`}>{voteText} </b>
        {item.timestamp
          ? `on ${parseDate({ time: new Date(item.timestamp).getTime(), timeFormat: 'MMM Do, YYYY' })}`
          : null}
      </span>
    </SatelliteVotingHistoryListItem>
  )
}

const SatellitesVotingHistory = ({
  satellite: { proposalVotingHistory, satelliteActionVotes, financialRequestsVotes, emergencyGovernanceVotes },
}: {
  satellite: SatelliteRecordType
}) => {
  const hasVoted =
    proposalVotingHistory.length ||
    satelliteActionVotes.length ||
    financialRequestsVotes.length ||
    emergencyGovernanceVotes.length

  if (!hasVoted)
    return (
      <div className="voting-info-list-wrapper scroll-block">
        <SatelliteVotingHistoryListItem>
          <p>No voting history available</p>
        </SatelliteVotingHistoryListItem>
      </div>
    )

  const allVotes = [
    ...proposalVotingHistory,
    ...satelliteActionVotes,
    ...financialRequestsVotes,
    ...emergencyGovernanceVotes,
  ]
  return (
    <div className="voting-info-list-wrapper scroll-block">{allVotes.map((item) => renderVotingHistoryItem(item))}</div>
  )
}

export const SatelliteDetails = () => {
  const { satelliteId } = useParams<{ satelliteId: string }>()
  const { satelliteMapper } = useSelector((state: State) => state.satellites)
  const currentSatellite = satelliteMapper[satelliteId]
  if (!currentSatellite) return <Redirect to={'/currentSatellite-nodes'} />

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent>
        <div>
          <SatellitePagination />

          {currentSatellite ? (
            <SatelliteListItem satellite={currentSatellite} isDetailsPage>
              <SatelliteCardBottomRow>
                <SatelliteDescrBlock>
                  <BlockName>Description</BlockName>
                  <p className="descr">{currentSatellite.description}</p>
                  {currentSatellite.website ? (
                    <a className="satellite-website" href={currentSatellite.website} target="_blank" rel="noreferrer">
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
                        value={currentSatellite.satelliteMetrics.proposalParticipation}
                        endingText="%"
                        showDecimal={false}
                      />
                    </p>
                    <h5>Vote Participation</h5>
                    <p>
                      <CommaNumber
                        value={currentSatellite.satelliteMetrics.votingPartisipation}
                        endingText="%"
                        showDecimal={false}
                      />
                    </p>
                    <h5>Oracle Participation</h5>
                    <p>
                      <CommaNumber
                        value={currentSatellite.satelliteMetrics.oracleEfficiency}
                        endingText="%"
                        showDecimal={false}
                      />
                    </p>
                  </SatelliteMetricsBlock>
                </div>

                <SatelliteVotingInfoWrapper>
                  <BlockName>Voting History</BlockName>
                  <SatellitesVotingHistory satellite={currentSatellite} />
                </SatelliteVotingInfoWrapper>
              </SatelliteCardBottomRow>
            </SatelliteListItem>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No proposals to show" />
              <figcaption> No currentSatellite data</figcaption>
            </EmptyContainer>
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}
