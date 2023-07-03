import { useMemo } from 'react'
import { Link } from 'react-router-dom'

// providers
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

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
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { getTotalDelegatedMVK } from 'providers/SatellitesProvider/helpers/satellites.utils'

// styles
import { SatelliteGovernanceStatsInfo } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import NewButton from 'app/App.components/Button/NewButton'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { EmptyContainer } from 'app/App.style'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper, SatellitesOverviewStyled } from './Satellites.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { NotStakingBanner } from './components/NotStakingBanner.view'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

const Satellites = () => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()
  const { activeSatellitesIds, satelliteMapper, isLoading: isSatellitesLoading } = useSatellitesContext()
  const { userTokensBalances, isSatellite } = useUserContext()

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
      {!isSatellite && getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) === 0 ? (
        <NotStakingBanner text="You are currently not staking MVK, please stake MVK in order to delegate to a satellite or become your own and take part in the platform’s governance" />
      ) : null}
      <PageContent>
        <SatellitesOverviewStyled>
          <InfoBlockWrapper>
            <SatelliteGovernanceStatsInfo>
              <h3>Total Delegated MVK</h3>
              <div className="value">
                {tabsInfo.totalDelegetedMVK}
                <a href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle">
                  <CustomTooltip iconId="info" text="All staked MVK that is delegated to satellites by users" />
                </a>
              </div>
            </SatelliteGovernanceStatsInfo>
            <SatelliteGovernanceStatsInfo>
              <h3>Number of Data Feeds</h3>
              <div className="value">{tabsInfo.numberOfDataFeeds}</div>
            </SatelliteGovernanceStatsInfo>
            <SatelliteGovernanceStatsInfo>
              <h3>Total Satellites & Oracles</h3>
              <div className="value">{tabsInfo.totalSatelliteOracles}</div>
            </SatelliteGovernanceStatsInfo>
          </InfoBlockWrapper>

          {isSatellitesLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellites and feeds data</div>
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
