import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

// context
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// view
import { SatellitesVotingHistory } from 'pages/SatelliteVotingHistory/SatelliteVotingHistory'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import SatellitePagination from './SatellitePagination/SatellitePagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { DataLoaderWrapper, SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import {
  BlockName,
  SatelliteCardBottomRow,
  SatelliteDescrBlock,
  SatelliteMetrics,
  SatelliteMetricsBlock,
  SatelliteVotingInfoWrapper,
} from './SatelliteDetails.style'

// helpers
import { useSatelliteVotes } from 'providers/SatellitesProvider/hooks/useSatelliteVotes'
import { getSatelliteParticipation } from 'providers/SatellitesProvider/helpers/satellites.utils'

// consts
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { FatalError } from 'errors/error'
import { CHECK_WHETHER_SATELLITE_EXISTS } from 'providers/SatellitesProvider/queries/satellites.query'

export const SatelliteDetails = () => {
  const { satelliteId } = useParams<{ satelliteId: string }>()
  const { apolloClient } = useApolloContext()
  const { fatal } = useToasterContext()
  const {
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    isLoading: isSatellitesLoading,
    setSatelliteAddressToSubscribe,
    changeSatellitesSubscriptionsList,
  } = useSatellitesContext()
  const currentSatellite = satelliteMapper[satelliteId]

  const { proposalParticipation, votingParticipation } = getSatelliteParticipation({
    satellite: currentSatellite,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
  })

  const [isSatelliteExistanseLoading, setIsSatelliteExistanseLoading] = useState(false)

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
      setSatelliteAddressToSubscribe(null)
    }
  }, [])

  // check whether satellite exists, cuz address is stored in url and user can change it
  useEffect(() => {
    if (satelliteId && satelliteMapper[satelliteId]) {
      setSatelliteAddressToSubscribe(satelliteId)
      return
    }

    setIsSatelliteExistanseLoading(true)

    const checkWhetherSatelliteExists = async () => {
      try {
        const satelliteFromGql = await apolloClient.query({
          query: CHECK_WHETHER_SATELLITE_EXISTS,
          variables: {
            userAddress: satelliteId ?? '',
          },
        })

        if (satelliteFromGql.data.satellite[0]?.user.address === satelliteId) {
          setSatelliteAddressToSubscribe(satelliteId)
          return
        }

        fatal(new FatalError(`Satellite with address ${satelliteId} does not exist`))
      } catch (e) {
        fatal(new FatalError('Loading satellite error, please, try to reload page'))
      } finally {
        setIsSatelliteExistanseLoading(false)
      }
    }

    checkWhetherSatelliteExists()

    return () => setSatelliteAddressToSubscribe(null)
  }, [satelliteId])

  const { satelliteVotes, isLoading: isSatelliteVotesLoading } = useSatelliteVotes(satelliteId)

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent className="mt-30">
        <div>
          <SatellitePagination />

          {isSatellitesLoading || isSatelliteExistanseLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellite profile data</div>
            </DataLoaderWrapper>
          ) : currentSatellite ? (
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
                        <CommaNumber value={votingParticipation} endingText="%" showDecimal={false} />
                      </p>
                      <h5>Oracle Participation</h5>
                      <p>
                        <CommaNumber value={currentSatellite.oracleEfficiency} endingText="%" showDecimal={false} />
                      </p>
                    </SatelliteMetricsBlock>
                  </div>

                  <SatelliteMetricsBlock>
                    <h5>Satellite’s sMVN</h5>
                    <p>
                      <CommaNumber value={currentSatellite.sMvnBalance} showDecimal />
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
                  {isSatelliteVotesLoading ? (
                    <div className="loader">
                      <SpinnerCircleLoaderStyled />
                    </div>
                  ) : (
                    <SatellitesVotingHistory satelliteVotes={satelliteVotes} />
                  )}
                </SatelliteVotingInfoWrapper>
              </SatelliteCardBottomRow>
            </SatelliteListItem>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt="No satellite to show" />
              <figcaption>Satellite with address "{satelliteId}" does not exist</figcaption>
            </EmptyContainer>
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}
