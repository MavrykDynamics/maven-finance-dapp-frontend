// consts
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { EmptyContainer as EmptyList } from 'app/App.style'
// styles
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper } from './Satellites.style'
// types

// view
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SmallInfoBlock } from 'pages/SatelliteGovernance/SatelliteGovernance.style'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { State } from 'reducers'
import { Link } from 'react-router-dom'
import Icon from 'app/App.components/Icon/Icon.view'
import { DataFeedCard } from 'pages/DataFeedsDetails/listItem/DataFeedCard.view'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'

type OraclesViewProps = {
  tabsInfo: {
    totalDelegetedMVK: string | number | JSX.Element
    totalSatelliteOracles: string | number | JSX.Element
    numberOfDataFeeds: string | number | JSX.Element
  }
  delegateCallback: (address: string) => void
  oracleSatellitesData: {
    userStakedBalance: number
    satelliteUserIsDelegatedTo?: string
    items: State['satellites']['activeSatellitesIds']
    delegateCallback: (address: string) => void
    undelegateCallback: (address: string) => void
  }
  dataFeedsData: {
    items: Array<Feed>
  }
}

type EmptyContainerType = {
  showSatellite: boolean
  showFeeds: boolean
}

const EmptyContainer = ({ showSatellite, showFeeds }: EmptyContainerType) => {
  const feedsMessage = 'No Data Feeds found'
  const satelliteMessage = 'No Satellites found'
  const generalMessage = 'No Satellites & Data Feeds found'

  const showMessage = !showSatellite && !showFeeds ? generalMessage : !showSatellite ? satelliteMessage : feedsMessage

  return (
    <EmptyList>
      <img src="/images/not-found.svg" alt={`${showMessage}`} />
      <figcaption>{showMessage}</figcaption>
    </EmptyList>
  )
}

const SatellitesView = ({ tabsInfo, oracleSatellitesData, dataFeedsData, delegateCallback }: OraclesViewProps) => {
  const isShowSatellites = Boolean(oracleSatellitesData.items.length)
  const isShowFeeds = Boolean(dataFeedsData.items.length)

  const satellites = oracleSatellitesData.items.slice(0, isShowFeeds ? 3 : 5)
  const feeds = dataFeedsData.items.slice(0, isShowSatellites ? 5 : 10)
  return (
    <Page>
      <PageHeader page={'satellites'} />
      {/* <PageContent>
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
          {satellites.length ? (
            <>
              <div className="top-list">
                <GovRightContainerTitleArea>
                  <h2>Top Satellites</h2>
                </GovRightContainerTitleArea>

                <Link to="/satellite-nodes">
                  <div className="see-all-link">
                    See all Satellites
                    <Icon id="arrow-left-stroke" />
                  </div>
                </Link>
              </div>

              <div className="list-wrapper">
                {satellites.map((satellite) => (
                  <SatelliteListItem feed={feed} key={satellite.} />
                ))}
              </div>
            </>
          ) : null}

          {feeds.length ? (
            <>
              <div className="top-list">
                <GovRightContainerTitleArea>
                  <h2>Popular Feeds</h2>
                </GovRightContainerTitleArea>

                <Link to="/data-feeds">
                  <div className="see-all-link">
                    See all Data Feeds
                    <Icon id="arrow-left-stroke" />
                  </div>
                </Link>
              </div>

              <div className="list-wrapper">
                {feeds.map((feed) => (
                  <DataFeedCard feed={feed} key={feed.address} />
                ))}
              </div>
            </>
          ) : null}

          {(!isShowSatellites || !isShowFeeds) && (
            <EmptyContainer showSatellite={isShowSatellites} showFeeds={isShowFeeds} />
          )}
        </div>
        <SatellitesSideBar />
      </PageContent> */}
    </Page>
  )
}

export default SatellitesView
