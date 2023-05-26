import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// providers
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
import { getTotalDelegatedMVK } from 'providers/SatellitesProvider/satellites.const'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

// styles
import { SmallInfoBlock } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import NewButton from 'app/App.components/Button/NewButton'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { EmptyContainer } from 'app/App.style'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper, SatellitesOverviewStyled } from './Satellites.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { NotStakingBanner } from './components/NotStakingBanner.view'
import { SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { USER_MVK_BALANCE_SUB } from 'providers/StakeProvider/helpers/stake.consts'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useSatellitesUpdater } from 'providers/SatellitesProvider/hooks/useSatellitesUpdater'

const Satellites = () => {
  const { isLoading: isFeedsLoading } = useDataFeedsUpdater()
  const { isIntialLoading: isDoormanLoading } = useStakeUpdater(false, [USER_MVK_BALANCE_SUB])

  const { feedsAddresses, feedsMapper } = useDataFeedsContext()

  const dispatch = useDispatch()
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { activeSatellitesIds, satelliteMapper } = useSatellitesContext()

  const {
    user: { isSatellite, userTokens },
  } = useSelector((state: State) => state.wallet)

  useSatellitesUpdater()

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isGovernanceLoaded || isDepsChanged) {
        dispatch(getGovernanceStorage())
      }
    } catch (e) {}
  }, [])

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: (
        <CommaNumber value={getTotalDelegatedMVK(activeSatellitesIds, satelliteMapper)} endingText={'MVK'} />
      ),
      totalSatelliteOracles: activeSatellitesIds.length,
      numberOfDataFeeds: feedsAddresses.length > 50 ? feedsAddresses.length + '+' : feedsAddresses.length,
    }),
    [activeSatellitesIds, feedsAddresses, satelliteMapper],
  )

  return (
    <Page>
      <PageHeader page={'satellites'} />
      {!isSatellite && userTokens[SMVK_TOKEN_SYMBOL].balance === 0 ? (
        <NotStakingBanner text="You are currently not staking MVK, please stake MVK in order to delegate to a satellite or become your own and take part in the platform’s governance" />
      ) : null}
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

          {isLoading || isDoormanLoading || isFeedsLoading ? (
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

              {feedsAddresses.length ? (
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
                    {feedsAddresses.slice(0, 3).map((feedAddress) => (
                      <DataFeedCard
                        feed={feedsMapper[feedAddress]}
                        oracleNodes={tabsInfo.totalSatelliteOracles}
                        key={feedAddress}
                      />
                    ))}
                  </div>
                </>
              ) : null}

              {feedsAddresses.length === 0 && activeSatellitesIds.length === 0 ? (
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
