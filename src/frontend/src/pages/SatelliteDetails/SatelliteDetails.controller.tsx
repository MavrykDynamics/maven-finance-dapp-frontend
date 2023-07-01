import { Redirect, useParams } from 'react-router-dom'

// context
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import SatellitePagination from './SatellitePagination/SatellitePagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import {
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  BlockName,
  SatelliteMetrics,
  SatelliteMetricsBlock,
  SatelliteVotingInfoWrapper,
  SatelliteVotingHistoryListItem,
} from './SatelliteDetails.style'

// helpers
import { parseDate } from 'utils/time'
import { getSatelliteParticipations } from 'providers/SatellitesProvider/helpers/satellites.utils'

// types
import { SATELLITE_VOTES_MAPPER } from 'providers/SatellitesProvider/satellites.provider.types'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'
import dayjs from 'dayjs'

const SatellitesVotingHistory = ({
  satellite: { proposalsVotes, satelliteActionVotes, financialRequestsVotes, eGovVotes },
}: {
  satellite: SatelliteRecordType
}) => {
  const hasVoted =
    proposalsVotes.length || satelliteActionVotes.length || financialRequestsVotes.length || eGovVotes.length

  if (!hasVoted)
    return (
      <div className="voting-info-list-wrapper scroll-block">
        <SatelliteVotingHistoryListItem>
          <p>No voting history available</p>
        </SatelliteVotingHistoryListItem>
      </div>
    )

  const allVotes = [...proposalsVotes, ...satelliteActionVotes, ...financialRequestsVotes, ...eGovVotes]
  return (
    <div className="voting-info-list-wrapper scroll-block">
      {allVotes.map(({ vote, id, voteName, timestamp }) => {
        const voteText = SATELLITE_VOTES_MAPPER[vote]
        const votedItemName = voteName.split('_').join(' ').toLowerCase()

        return (
          <SatelliteVotingHistoryListItem key={`${voteName}_${id}`}>
            <p>{votedItemName}</p>
            <span className="currentSatellite-voting-history-info">
              Voted <b className={`voting-${voteText.toLowerCase()}`}>{voteText} </b>
              {timestamp ? `on ${parseDate({ time: dayjs(timestamp).unix(), timeFormat: 'MMM Do, YYYY' })}` : null}
            </span>
          </SatelliteVotingHistoryListItem>
        )
      })}
    </div>
  )
}

export const SatelliteDetails = () => {
  const { satelliteId } = useParams<{ satelliteId: string }>()
  const { satelliteMapper, eGovProposalsAmount, proposalsAmount, executedProposalAmount, finRequestsAmount } =
    useSatellitesContext()
  const currentSatellite = satelliteMapper[satelliteId]

  const { proposalParticipation, votingPartisipation } = getSatelliteParticipations({
    satellite: currentSatellite,
    eGovProposalsAmount,
    proposalsAmount,
    executedProposalAmount,
    finRequestsAmount,
  })

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

                <SatelliteMetrics>
                  <div>
                    <BlockName>Satellite metrics</BlockName>
                    <SatelliteMetricsBlock>
                      <h5>Proposal Participation</h5>
                      <p>
                        <CommaNumber value={proposalParticipation} endingText="%" showDecimal={false} />
                      </p>
                      <h5>Vote Participation</h5>
                      <p>
                        <CommaNumber value={votingPartisipation} endingText="%" showDecimal={false} />
                      </p>
                      <h5>Oracle Participation</h5>
                      <p>
                        <CommaNumber value={currentSatellite.oracleEfficiency} endingText="%" showDecimal={false} />
                      </p>
                    </SatelliteMetricsBlock>
                  </div>

                  <SatelliteMetricsBlock>
                    <h5>Satellite’s sMVK</h5>
                    <p>
                      <CommaNumber value={currentSatellite.sMvkBalance} showDecimal />
                    </p>
                    <h5># Delegators</h5>
                    <p>
                      <CommaNumber value={currentSatellite.delegatorCount} showDecimal={false} />
                    </p>
                    <h5># Oracle Feeds</h5>
                    <p>
                      <CommaNumber value={Object.keys(currentSatellite.participatedFeeds).length} showDecimal={false} />
                    </p>
                  </SatelliteMetricsBlock>
                </SatelliteMetrics>

                <SatelliteVotingInfoWrapper>
                  <BlockName>Voting History</BlockName>
                  <SatellitesVotingHistory satellite={currentSatellite} />
                </SatelliteVotingInfoWrapper>
              </SatelliteCardBottomRow>
            </SatelliteListItem>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No proposals to show" />
              <figcaption> No Current Satellite data</figcaption>
            </EmptyContainer>
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}
