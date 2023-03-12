import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'

// consts, helpers
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { INFO } from 'app/App.components/Toaster/Toaster.constants'
import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import { parseDate } from 'utils/time'
import { cyanColor, downColor, Page, skyColor } from 'styles'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { registerFeedAction } from 'pages/DataFeeds/DataFeeds.actions'
import { ORACLES_DATA_IN_FEED_LIST_NAME, PAGINATION_SIDE_RIGHT } from 'app/App.components/Pagination/pagination.consts'

// view
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import DataFeedsPagination from './pagination/DataFeedsPagination.controler'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { DataFeedsChart } from './chart/DataFeedsChart.controller'
import { OracleCard } from 'pages/DataFeedsDetails/listItem/OracleCard.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'

// types
import { State } from 'reducers'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

// styles
import {
  ContractDetails,
  DataFeedInfoBlock,
  DataFeedsStyled,
  DataFeedValueText,
  FeedInfo,
} from './DataFeedsDetails.style'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { GovRightContainerTitleArea } from 'pages/Governance/Governance.style'
import colors from 'styles/colors'

type FeedDetailsProps = {
  feed: Feed | null
  isLoading: boolean
  feedsSatellites: Array<SatelliteRecordType>
}

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

const DataFeedDetailsView = ({ feed, feedsSatellites, isLoading }: FeedDetailsProps) => {
  const dispatch = useDispatch()
  const { dipDupContracts } = useSelector((state: State) => state.tokens)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const registerFeedHandler = () => dispatch(registerFeedAction())

  const [activeTab, setActiveTab] = useState(tabsList[0].id)

  const isTrustedAnswer = feed && feed.last_completed_data_pct_oracle_resp >= feed.pct_oracle_threshold

  const imageLink = dipDupContracts.find(({ contract }) => contract === feed?.address)?.metadata?.icon

  return (
    <Page>
      <PageHeader page={'data-feeds'} />

      {isLoading || !feed ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading data feeds</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <DataFeedsPagination />

          <DataFeedsStyled>
            <div className="top-section-wrapper">
              <FeedInfo>
                <div className="top">
                  <div className="name-part">
                    <ImageWithPlug imageLink={imageLink} alt={`${feed.name} logo`} />
                    <div className="text">
                      <div className="name">{feed.name}</div>
                      <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
                        Learn how to use {feed.name} in your smart contracts here
                        <CustomTooltip
                          className="info-icon"
                          iconId={'question'}
                          defaultStrokeColor={colors[themeSelected].textColor}
                        />
                      </a>
                    </div>
                  </div>
                  <div className="price-part">
                    <DataFeedValueText fontSize={22} fontWeidth={600} className="shield">
                      <Icon id={isTrustedAnswer ? 'trustShield' : 'notTrustedShield'} />
                      <CommaNumber beginningText="$" value={feed.amount} showDecimal decimalsToShow={6} />
                    </DataFeedValueText>
                    <h3>
                      {isTrustedAnswer ? 'Trusted Answer' : 'Not Trusted Answer'}
                      <CustomTooltip
                        text={`The current price is ${
                          isTrustedAnswer ? 'trusted' : 'not trusted'
                        } and approved by a majority of the oracles`}
                        iconId={'info'}
                        className="info-icon"
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </h3>
                  </div>
                </div>
                <div className="bottom">
                  <DataFeedInfoBlock>
                    <h3>
                      Trigger Trigger
                      <CustomTooltip
                        text={`If the price of the asset is volatile and changes more than the set deviation trigger, a new trusted price will be pushed on chain from the oracle. Aside from the deviation trigger, price updates occur on average every 15 minutes.`}
                        iconId={'info'}
                        defaultStrokeColor={colors[themeSelected].textColor}
                        className="info-icon"
                      />
                    </h3>

                    <h4>Deviation threshold</h4>

                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.alpha_pct_per_thousand}%
                    </DataFeedValueText>
                  </DataFeedInfoBlock>

                  <DataFeedInfoBlock justifyContent={'flex-end'}>
                    <h4>
                      Heartbeat
                      <CustomTooltip
                        text={'Countdown until the next set data feed update.'}
                        iconId={'info'}
                        className="info-icon"
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </h4>
                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.last_completed_data_last_updated_at ? (
                        <div className="timer">
                          <Timer
                            options={{
                              short: true,
                              showZeros: false,
                              negativeColor: isTrustedAnswer ? cyanColor : downColor,
                              defaultColor: skyColor,
                            }}
                            timestamp={
                              new Date(feed.last_completed_data_last_updated_at).getTime() +
                              feed.heart_beat_seconds * 1000
                            }
                          />
                        </div>
                      ) : null}
                    </DataFeedValueText>
                  </DataFeedInfoBlock>

                  <DataFeedInfoBlock>
                    <h3>
                      Oracle responses
                      <CustomTooltip
                        className="info-icon"
                        text={`The aggregator requires a minimum amount of responses from oracles for the answer to be trusted`}
                        iconId={'info'}
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </h3>
                    <h4>Minimum of {feed.pct_oracle_threshold}%</h4>
                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.last_completed_data_pct_oracle_resp}%
                    </DataFeedValueText>
                  </DataFeedInfoBlock>

                  <DataFeedInfoBlock>
                    <h3>
                      Last update
                      <CustomTooltip
                        text={`Last time the aggregator was updated with a trusted answer and written on-chain`}
                        iconId={'info'}
                        className="info-icon"
                        defaultStrokeColor={colors[themeSelected].textColor}
                      />
                    </h3>
                    <DataFeedValueText fontSize={14} fontWeidth={500} style={{ padding: '2px 0' }}>
                      {parseDate({
                        time: feed.last_completed_data_last_updated_at,
                        timeFormat: 'MMM Do, YYYY, HH:mm:ss',
                      })}
                    </DataFeedValueText>
                  </DataFeedInfoBlock>
                </div>
              </FeedInfo>

              <ContractDetails>
                <div className="block-name">Oracle Contract Details</div>
                <div className="info-wrapper">
                  <h3>
                    Contract address
                    <CustomTooltip
                      text={`Address of this specific data feed`}
                      iconId={'info'}
                      className="info-icon"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </h3>
                  <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                    <TzAddress tzAddress={feed.address} type={BLUE} hasIcon={true} />
                  </DataFeedValueText>
                </div>
                <div className="info-wrapper">
                  <h3>
                    Oracle Factory
                    <CustomTooltip
                      text={`Address of the oracle (aggregator) factory which is responsible for creating the aggregator feeds which oracles can sign price feeds for`}
                      iconId={'info'}
                      className="info-icon"
                      defaultStrokeColor={colors[themeSelected].textColor}
                    />
                  </h3>
                  <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                    {feed.factory?.address ? (
                      <TzAddress tzAddress={feed.factory?.address} type={BLUE} hasIcon={true} />
                    ) : (
                      '-'
                    )}
                  </DataFeedValueText>
                </div>
                <div className="register-pair-wrapper">
                  <Button
                    text="Register"
                    kind={ACTION_PRIMARY}
                    onClick={() => {
                      // registerFeedHandler()
                      dispatch(showToaster(INFO, 'Coming soon', 'Register to Oracle Feature coming soon'))
                    }}
                  />
                </div>
              </ContractDetails>
            </div>

            <div className="chart-wrapper">
              <div className="buttons-wrapper">
                {tabsList.length
                  ? tabsList.map(({ text, id }) => (
                      <Button
                        key={id}
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
                dataFeedsHistory={feed.dataFeedsHistory}
                dataFeedsVolatility={feed.dataFeedsVolatility}
                tooltipAsset={feed.name.split('/')?.[1]}
              />
            </div>

            {feedsSatellites.length ? (
              <>
                <GovRightContainerTitleArea>
                  <h1>Oracles data</h1>
                </GovRightContainerTitleArea>

                <div className={`oracles-list`}>
                  {feedsSatellites.map((item) => (
                    <OracleCard oracle={item} key={item.address} />
                  ))}

                  <Pagination
                    itemsCount={feedsSatellites.length}
                    side={PAGINATION_SIDE_RIGHT}
                    listName={ORACLES_DATA_IN_FEED_LIST_NAME}
                  />
                </div>
              </>
            ) : (
              <EmptyContainer>
                <img src="/images/not-found.svg" alt=" No proposals to show" />
                <figcaption> No oracles to show</figcaption>
              </EmptyContainer>
            )}
          </DataFeedsStyled>
        </>
      )}

      {/* <UsersListWrapper className="oracle-list-wrapper">
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
      </UsersListWrapper> */}
    </Page>
  )
}

export default DataFeedDetailsView
