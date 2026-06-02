import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'

// providers
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

// view
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { SatelliteListItem } from './listItem/SateliteCard.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { DataFeedCard } from '../DataFeedsDetails/listItem/DataFeedCard.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Info } from 'app/App.components/Info/Info.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts, helpers, actions
import { BUTTON_PRIMARY, BUTTON_SIMPLE, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { INFO_ERROR } from 'app/App.components/Info/info.constants'
import { NOT_STAKING_MVN_TEXT } from 'app/App.components/Info/Banners/banners.texts'

// styles
import { SatelliteGovernanceStatsInfo } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import NewButton from 'app/App.components/Button/NewButton'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { EmptyContainer } from 'app/App.style'
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper, SatellitesOverviewStyled } from './Satellites.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PAGINATION_ACTIVE,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ACTIVE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { NotStakingBannerStyled } from 'app/App.components/Info/Banners/BecomeSatelliteBanners/BecomeSatelliteBanners.style'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

type CanFetchStatus = 'initial' | 'default' | 'refetch' | 'fallback' | 'done'

const Satellites = () => {
  const { feedsAddresses, feedsMapper } = useDataFeedsContext()
  const { totalDelegatedMVN } = useSatelliteStatistics()
  const {
    activeSatellitesIds,
    satelliteActiveMapper,
    isLoading: isSatellitesLoading,
    changeSatellitesSubscriptionsList,
    totalSatellitesCount,
    updateSatelliteQueryFilters,
  } = useSatellitesContext()
  const { userTokensBalances, isSatellite, userAddress } = useUserContext()

  const [canFetchSatellitesStatus, setCanFetchSatellitesStatus] = useState<CanFetchStatus>('initial')

  useEffect(() => {
    if (canFetchSatellitesStatus === 'initial') {
      const filtered = { where: { participated_feeds: { _neq: '0' } } }
      updateSatelliteQueryFilters(filtered, SATELLITE_PAGINATION_ACTIVE)
      setCanFetchSatellitesStatus('default')
    }

    if (canFetchSatellitesStatus === 'refetch') {
      const noFilter = { where: {} }
      updateSatelliteQueryFilters(noFilter, SATELLITE_PAGINATION_ACTIVE)
      setCanFetchSatellitesStatus('fallback')
    }
  }, [canFetchSatellitesStatus])

  useEffect(() => {
    if (isSatellitesLoading === false && activeSatellitesIds.length === 0) {
      if (canFetchSatellitesStatus === 'default') {
        setCanFetchSatellitesStatus('refetch') // retry without filter
      } else if (canFetchSatellitesStatus === 'fallback') {
        setCanFetchSatellitesStatus('done') // stop retrying
      }
    }
  }, [isSatellitesLoading, activeSatellitesIds, canFetchSatellitesStatus])

  const canFetchSatellites = useMemo(
    () => ['default', 'fallback', 'done'].includes(canFetchSatellitesStatus),
    [canFetchSatellitesStatus],
  )

  useEffect(() => {
    if (canFetchSatellites) {
      changeSatellitesSubscriptionsList({
        [SATELLITE_DATA_SUB]: SATELLITES_DATA_ACTIVE_SUB,
        [SATELLITE_PARTICIPATION_DATA_SUB]: true,
      })

      return () => {
        changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
      }
    }

    return () => {}
  }, [canFetchSatellites])

  const tabsInfo = useMemo(
    () => ({
      totalDelegatedMVN: <CommaNumber value={totalDelegatedMVN} endingText={'MVN'} />,
      totalSatelliteOracles: totalSatellitesCount,
      numberOfDataFeeds: feedsAddresses.length > 50 ? feedsAddresses.length + '+' : feedsAddresses.length,
    }),
    [totalDelegatedMVN, totalSatellitesCount, feedsAddresses.length],
  )

  return (
    <Page>
      <PageHeader page={'satellites'} />
      {!isSatellite &&
      getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }) === 0 &&
      userAddress ? (
        <NotStakingBannerStyled>
          <Info text={NOT_STAKING_MVN_TEXT} type={INFO_ERROR}>
            <div className="link-btn">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="staking" />
                  Staking
                </NewButton>
              </Link>
            </div>
          </Info>
        </NotStakingBannerStyled>
      ) : null}
      <PageContent className="mt-30">
        <SatellitesOverviewStyled>
          <InfoBlockWrapper>
            <SatelliteGovernanceStatsInfo>
              <h3>Total Delegated MVN</h3>
              <div className="value">
                {tabsInfo.totalDelegatedMVN}
                <CustomLink to="https://docs.mavenfinance.io/maven-finance/satellites-and-oracles">
                  <Tooltip>
                    <Tooltip.Trigger className="tooltip-trigger">
                      <Icon id="info" />
                    </Tooltip.Trigger>
                    <Tooltip.Content>All staked MVN that is delegated to satellites by users.</Tooltip.Content>
                  </Tooltip>
                </CustomLink>
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
                    {activeSatellitesIds.slice(0, 3).map((satelliteAddress) => {
                      if (!satelliteActiveMapper[satelliteAddress]) return null
                      return (
                        <SatelliteListItem satellite={satelliteActiveMapper[satelliteAddress]} key={satelliteAddress} />
                      )
                    })}
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
