import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// providers
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import { useStakeUpdater } from 'providers/StakeProvider/hooks/useStakeUpdater'

// types
import { State } from 'reducers'

// view
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SatelliteListItem } from './listItem/SateliteCard.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { DataFeedCard } from '../DataFeedsDetails/listItem/DataFeedCard.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts, helpers, actions
import { getTotalDelegatedMVK } from './helpers/Satellites.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'

// styles
import { SmallInfoBlock } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import NewButton from 'app/App.components/Button/NewButton'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { EmptyContainer } from 'app/App.style'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper, SatellitesOverviewStyled } from './Satellites.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

const Satellites = () => {
  const dispatch = useDispatch()
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { activeSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const { feedsLedger, isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isDoormanLoaded } = useStakeContext()

  useStakeUpdater(true)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isFeedsLoaded || isDepsChanged) && dispatch(getFeedsStorage()),
          (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: (
        <CommaNumber value={getTotalDelegatedMVK(activeSatellitesIds, satelliteMapper)} endingText={'MVK'} />
      ),
      totalSatelliteOracles: activeSatellitesIds.length,
      numberOfDataFeeds: feedsLedger.length > 50 ? feedsLedger.length + '+' : feedsLedger.length,
    }),
    [activeSatellitesIds, feedsLedger, satelliteMapper],
  )

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent>
        <SatellitesOverviewStyled>
          <InfoBlockWrapper>
            <SmallInfoBlock>
              <h3>Total Delegated MVK</h3>
              <div className="info-content">
                {tabsInfo.totalDelegetedMVK}
                <a href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle">
                  <CustomTooltip iconId="info" text="All staked MVK that is delegated to satellites by users" />
                </a>
              </div>
            </SmallInfoBlock>
            <SmallInfoBlock>
              <h3>Total Satellites & Oracles</h3>
              <div className="info-content">{tabsInfo.totalSatelliteOracles}</div>
            </SmallInfoBlock>
            <SmallInfoBlock>
              <h3>Number of Data Feeds</h3>
              <div className="info-content">{tabsInfo.numberOfDataFeeds}</div>
            </SmallInfoBlock>
          </InfoBlockWrapper>

          {isLoading && isDoormanLoaded ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellites and data feeds data</div>
            </DataLoaderWrapper>
          ) : (
            <>
              {activeSatellitesIds.length ? (
                <>
                  <div className="top-list">
                    <H2Title>Top Satellites</H2Title>

                    <Link to="/satellite-nodes">
                      <NewButton kind={BUTTON_SIMPLE}>
                        See all Satellites
                        <Icon id="full-arrow-right" />
                      </NewButton>
                    </Link>
                  </div>

                  <div className={`satellitesList`}>
                    {activeSatellitesIds.slice(0, 3).map((satelliteAddress) => (
                      <SatelliteListItem satellite={satelliteMapper[satelliteAddress]} key={satelliteAddress} />
                    ))}
                  </div>
                </>
              ) : null}

              {feedsLedger.length ? (
                <>
                  <div className="top-list">
                    <H2Title>Popular Feeds</H2Title>

                    <Link to="/data-feeds">
                      <NewButton kind={BUTTON_SIMPLE}>
                        See all Data Feeds
                        <Icon id="full-arrow-right" />
                      </NewButton>
                    </Link>
                  </div>

                  <div className={`satellitesList`}>
                    {feedsLedger.slice(0, 3).map((feed) => (
                      <DataFeedCard feed={feed} key={feed.address} />
                    ))}
                  </div>
                </>
              ) : null}

              {feedsLedger.length === 0 && activeSatellitesIds.length === 0 ? (
                <EmptyContainer>
                  <img src="/images/not-found.svg" alt={`no satellites and data feeds`} />
                  <figcaption>No satellites and data feeds</figcaption>
                </EmptyContainer>
              ) : null}
            </>
          )}
        </SatellitesOverviewStyled>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default Satellites
