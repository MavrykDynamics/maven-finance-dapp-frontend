import Icon from 'app/App.components/Icon/Icon.view'
// consts
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { EmptyContainer as EmptyList } from 'app/App.style'
import { FEEDS_TOP_LIST_NAME, SATELITES_TOP_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { Link } from 'react-router-dom'
// styles
import { Page, PageContent } from 'styles'
import { InfoBlockWrapper, SatelliteListStyled } from './Satellites.style'
// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { Feed } from './helpers/Satellites.types'
// view
import SatelliteList from './SatelliteList/SatellitesList.controller'
import SatellitesSideBar from './SatellitesSideBar/SatellitesSideBar.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { SmallInfoBlock } from 'pages/SatelliteGovernance/SatelliteGovernance.style'

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
    items: SatelliteRecord[]
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
          {isShowSatellites ? (
            <div className="oracle-list-wrapper">
              <Link to="/satellite-nodes">
                <div className="see-all-link">
                  See all Satellites
                  <Icon id="arrow-left-stroke" />
                </div>
              </Link>
              <SatelliteList
                listTitle={'Top Satellites'}
                items={satellites}
                listType={'satellites'}
                name={SATELITES_TOP_LIST_NAME}
                additionaldata={oracleSatellitesData}
                pagination={false}
              />
            </div>
          ) : null}

          {isShowFeeds ? (
            <div className="oracle-list-wrapper">
              <Link to="/data-feeds">
                <div className="see-all-link">
                  See all Data Feeds
                  <Icon id="arrow-left-stroke" />
                </div>
              </Link>
              <SatelliteListStyled
                listTitle={'Popular Feeds'}
                items={feeds}
                listType={'feeds'}
                name={FEEDS_TOP_LIST_NAME}
                onClickHandler={delegateCallback}
                pagination={false}
              />
            </div>
          ) : null}

          {(!isShowSatellites || !isShowFeeds) && (
            <EmptyContainer showSatellite={isShowSatellites} showFeeds={isShowFeeds} />
          )}
        </div>
        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default SatellitesView
