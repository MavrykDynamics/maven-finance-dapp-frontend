import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// consts, helpers
import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import { usersData } from 'pages/UsersOracles/users.const'
import { ORACLES_DATA_IN_FEED_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { handleCoinName } from 'pages/Satellites/SatelliteList/ListCards/DataFeedCard.view'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DataFeedsChart } from '../chart/DataFeedsChart.controller'

// types
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { DataFeedsHistory, DataFeedsVolatility } from '../../Satellites/helpers/Satellites.types'

import DataFeedsPagination from '../pagination/DataFeedspagination.controler'
// styles
import {
  DataFeedInfoBlock,
  DataFeedsStyled,
  DataFeedsTitle,
  DataFeedSubTitleText,
  DataFeedValueText,
  UsersListCardsWrapper,
  UsersListWrapper,
  UserSmallCard,
} from './DataFeedsDetails.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import { EmptyContainer } from 'app/App.style'
import { cyanColor, downColor, Page } from 'styles'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { parseDate } from 'utils/time'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

type FeedDetailsProps = {
  feed: FeedGQL | null
  oracles: Array<SatelliteRecord>
  registerFeedHandler: () => void
  dataFeedsHistory: DataFeedsHistory
  dataFeedsVolatility: DataFeedsVolatility
}

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)

const tabsList = [
  {
    text: 'Answer History',
    id: 1,
  },
  {
    text: 'Volatility',
    id: 2,
  },
]

const DataFeedDetailsView = ({
  feed,
  oracles,
  registerFeedHandler,
  dataFeedsHistory,
  dataFeedsVolatility,
}: FeedDetailsProps) => {
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const [isClickedRegister, setClickedRegister] = useState(false)
  const [activeTab, setActiveTab] = useState(tabsList[0].id)
  const oraclesForFeed = useMemo(
    () => oracles.filter(({ oracleRecords }) => oracleRecords.find(({ feedAddress }) => feed?.address === feedAddress)),
    [oracles],
  )

  const isTrustedAnswer = feed && feed.last_completed_data_pct_oracle_resp >= feed.pct_oracle_threshold
  // const heartbeatUpdateInfo =
  //   dayjs(Date.now()).diff(dayjs(feed?.last_completed_data_last_updated_at), 'minutes') >= 30
  //     ? `
  // Price feed is outdated, missed the schedule price update at ${parseDate({
  //   time: new Date(feed?.last_completed_data_last_updated_at || '').getTime() + 1000 * 60 * 30,
  //   timeFormat: 'MMM DD, HH:mm:ss',
  // })}
  // `
  //     : `
  // Price feed updated every 30 mins, starting from latest time it was updated
  // `

  const imageLink = dipDupTokens.find(({ contract }) => contract === feed?.address)?.metadata?.icon

  return feed ? (
    <Page>
      <PageHeader page={'data-feeds'} />
      <DataFeedsPagination />

      <DataFeedsStyled>
        <div className="top-section-wrapper">
          <div className="left-part">
            <div className="top">
              <div className="name-part">
                <div className="img-wrapper">
                  <CoinsLogo imageLink={imageLink} assetName={handleCoinName(feed.name)} />
                </div>
                <div className="text">
                  <DataFeedsTitle fontSize={25} fontWeidth={700}>
                    {feed.name}
                  </DataFeedsTitle>
                  <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
                    Learn how to use {feed.name} in your smart contracts here
                    <CustomTooltip className="info-icon" iconId={'question'} />
                  </a>
                </div>
              </div>
              <div className="price-part">
                <DataFeedValueText fontSize={22} fontWeidth={600} className="shield">
                  <Icon id={isTrustedAnswer ? 'trustShield' : 'notTrustedShield'} />
                  <CommaNumber beginningText="$" value={feed.last_completed_data} />
                </DataFeedValueText>
                <DataFeedsTitle fontSize={14} fontWeidth={500}>
                  {isTrustedAnswer ? 'Trusted Answer' : 'Not Trusted Answer'}
                  <CustomTooltip
                    text={`The current price is trusted and approved by a majority of the oracles`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
              </div>
            </div>
            <div className="bottom">
              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={14} fontWeidth={600}>
                  Trigger parameters
                  <CustomTooltip
                    text={`A new trusted answer is written when the off-chain data moves more than the deviation threshold or 30 seconds have passed since the last answer was written on-chain`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>

                <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
                  Deviation threshold
                </DataFeedSubTitleText>

                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.pct_oracle_threshold}%
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock justifyContent={'flex-end'}>
                <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
                  Heartbeat
                  <CustomTooltip
                    text={'Timer until the next feed data will be written on chain'}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_last_updated_at ? (
                    <div className="timer">
                      <Timer
                        options={{
                          short: true,
                          showZeros: false,
                          negativeColor: isTrustedAnswer ? cyanColor : downColor,
                          defaultColor: cyanColor,
                        }}
                        timestamp={new Date(feed.last_completed_data_last_updated_at).getTime() + 1000 * 60 * 30}
                      />
                    </div>
                  ) : null}
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={14} fontWeidth={600}>
                  Oracle responses
                  <CustomTooltip
                    className="info-icon"
                    text={`The aggregator requires a minimum amount of responses from oracles for the answer to be trusted`}
                    iconId={'info'}
                  />
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
                  Minimum of {feed.pct_oracle_threshold}%
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_pct_oracle_resp}%
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock>
                <DataFeedsTitle fontSize={14} fontWeidth={600}>
                  Last update
                  <CustomTooltip
                    text={`Last time the aggregator was updated with a trusted answer and written on-chain`}
                    iconId={'info'}
                    className="info-icon"
                  />
                </DataFeedsTitle>
                <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
                  {parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}
                </DataFeedSubTitleText>
                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_last_updated_at ? (
                    <div className="timer">
                      <Timer
                        options={{
                          short: true,
                          showZeros: false,
                          negativeColor: cyanColor,
                          defaultColor: cyanColor,
                        }}
                        timestamp={new Date(feed.last_completed_data_last_updated_at).getTime() + 1000 * 60 * 30}
                      />
                    </div>
                  ) : null}
                </DataFeedValueText>
              </DataFeedInfoBlock>
            </div>
          </div>

          <div className="right-part">
            <h3>Oracle Contract Details</h3>
            <div className="info-wrapper">
              <DataFeedsTitle fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                Contract address
                <CustomTooltip text={`Address of this specific data feed`} iconId={'info'} className="info-icon" />
              </DataFeedsTitle>
              <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                <TzAddress tzAddress={feed.address} type={BLUE} hasIcon={true} />
              </DataFeedValueText>
            </div>
            <div className="info-wrapper">
              <DataFeedsTitle fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                Oracle Factory
                <CustomTooltip
                  text={`Address of the oracle (aggregator) factory which is responsible for creating the aggregator feeds which oracles can sign price feeds for`}
                  iconId={'info'}
                  className="info-icon"
                />
              </DataFeedsTitle>
              <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                <TzAddress tzAddress={feed.factory?.address ?? feed.admin} type={BLUE} hasIcon={true} />
              </DataFeedValueText>
            </div>
            {!isClickedRegister ? (
              <div className="register-pair-wrapper">
                <Button
                  text="Register"
                  kind={ACTION_PRIMARY}
                  onClick={() => {
                    setClickedRegister(true)
                    registerFeedHandler()
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="chart-wrapper">
          <div className="buttons-wrapper">
            {tabsList.length
              ? tabsList.map(({ text, id }) => (
                  <Button
                    text={text}
                    kind={ACTION_SIMPLE}
                    className={id === activeTab ? 'active' : ''}
                    onClick={() => setActiveTab(id)}
                  />
                ))
              : null}
          </div>

          <DataFeedsChart
            activeTab={activeTab}
            dataFeedsHistory={dataFeedsHistory}
            dataFeedsVolatility={dataFeedsVolatility}
          />
        </div>
      </DataFeedsStyled>

      {oraclesForFeed.length ? (
        <SatelliteList
          listTitle={'Oracles data'}
          items={oraclesForFeed}
          listType={'oracles'}
          name={ORACLES_DATA_IN_FEED_LIST_NAME}
        />
      ) : (
        emptyContainer
      )}

      <UsersListWrapper className="oracle-list-wrapper">
        <GovRightContainerTitleArea>
          <h1>Users</h1>
        </GovRightContainerTitleArea>

        <Link to="oracles-users">
          <div className="see-all-link">
            See all users
            <Icon id="arrow-left-stroke" />
          </div>
        </Link>

        <UsersListCardsWrapper>
          {usersData.map((user) => (
            <Link to={`/satellites/user-details/${user.id}`} key={user.id}>
              <UserSmallCard>
                <div className="img-wrapper">logo</div>
                {user.name}
              </UserSmallCard>
            </Link>
          ))}
        </UsersListCardsWrapper>
      </UsersListWrapper>
    </Page>
  ) : null
}

export default DataFeedDetailsView
