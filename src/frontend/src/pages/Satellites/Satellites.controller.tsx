import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

// providers
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useStakeContext } from 'providers/StakeProvider/stake.provider'

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
import { MVK_BALANCE_SUB, MVK_TOTAL_SUB, SMVK_HISTORY_SUB } from 'providers/StakeProvider/helpers/stake.consts'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'

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

const Satellites = () => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()
  const { userTokensBalances, isSatellite } = useUserContext()
  const { changeStakingSubscriptionsList, isLoading: isDoormanLoading } = useStakeContext()

  const dispatch = useDispatch()
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { activeSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)

  useEffect(() => {
    changeStakingSubscriptionsList({
      [MVK_BALANCE_SUB]: false,
      [MVK_TOTAL_SUB]: false,
      [SMVK_HISTORY_SUB]: false,
    })
  }, [])

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
              <h3>Total Satellites & Oracles</h3>
              <div className="value">{tabsInfo.totalSatelliteOracles}</div>
            </SatelliteGovernanceStatsInfo>
            <SatelliteGovernanceStatsInfo>
              <h3>Number of Data Feeds</h3>
              <div className="value">{tabsInfo.numberOfDataFeeds}</div>
            </SatelliteGovernanceStatsInfo>
          </InfoBlockWrapper>

          {isLoading || isDoormanLoading ? (
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
                      <DataFeedCard feed={feedsMapper[feedAddress]} key={feedAddress} />
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
