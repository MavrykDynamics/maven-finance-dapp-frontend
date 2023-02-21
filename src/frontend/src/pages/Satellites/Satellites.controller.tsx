import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// types
import { State } from 'reducers'

// view
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts, helpers, actions
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getTotalDelegatedMVK } from './helpers/Satellites.consts'
import { delegate, undelegate } from 'pages/Satellites/Satellites.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'

import { Page, PageContent } from 'styles'
import { InfoBlockWrapper } from './Satellites.style'
// types

// view
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SmallInfoBlock } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import { Link } from 'react-router-dom'
import { SatelliteListItem } from './listItem/SateliteCard.view'
import Icon from 'app/App.components/Icon/Icon.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { DataFeedCard } from '../DataFeedsDetails/listItem/DataFeedCard.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'

const Satellites = () => {
  const { allSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const { feedsLedger, isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isDoormanLoaded } = useSelector((state: State) => state.doorman)
  const {
    user: { mySMvkTokenBalance, satelliteMvkIsDelegatedTo },
  } = useSelector((state: State) => state.wallet)
  const dispatch = useDispatch()

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [!isFeedsLoaded && dispatch(getFeedsStorage()), !isDoormanLoaded && dispatch(getDoormanStorage())].filter(
          Boolean,
        ),
      )
    } catch (e) {}
  }, [])

  const totalDelegatedMVK = getTotalDelegatedMVK(allSatellitesIds, satelliteMapper)

  const tabsInfo = useMemo(
    () => ({
      totalDelegetedMVK: <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />,
      totalSatelliteOracles: allSatellitesIds.length,
      numberOfDataFeeds: feedsLedger.length > 50 ? feedsLedger.length + '+' : feedsLedger.length,
    }),
    [allSatellitesIds, feedsLedger, totalDelegatedMVK],
  )

  const delegateCallback = (satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }

  const undelegateCallback = (delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }

  return (
    <Page>
      <PageHeader page={'satellites'} />
      <PageContent>
        <div className="left-content-wrapper">
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
          {allSatellitesIds.length ? (
            <div className="oracle-list-wrapper">
              <Link to="/satellite-nodes">
                <div className="see-all-link">
                  See all Satellites
                  <Icon id="arrow-left-stroke" />
                </div>
              </Link>

              <GovRightContainerTitleArea>
                <h1>Top Satellites</h1>
              </GovRightContainerTitleArea>

              <div className={`satellitesList`}>
                {allSatellitesIds.slice(0, 3).map((satelliteAddress) => (
                  <SatelliteListItem
                    satellite={satelliteMapper[satelliteAddress]}
                    key={satelliteAddress}
                    delegateCallback={delegateCallback}
                    undelegateCallback={undelegateCallback}
                    userStakedBalance={mySMvkTokenBalance}
                    satelliteUserIsDelegatedTo={satelliteMvkIsDelegatedTo}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {feedsLedger.length ? (
            <div className="oracle-list-wrapper">
              <Link to="/data-feeds">
                <div className="see-all-link">
                  See all Data Feeds
                  <Icon id="arrow-left-stroke" />
                </div>
              </Link>

              <GovRightContainerTitleArea>
                <h1>Popular Feeds</h1>
              </GovRightContainerTitleArea>

              <div className={`satellitesList`}>
                {feedsLedger.slice(0, 3).map((feed) => (
                  <DataFeedCard feed={feed} key={feed.address} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default Satellites
