import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Redirect, useLocation, useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'

// providers
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

// view
import DataFeedsPagination from './pagination/DataFeedsPagination.controler'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { OracleCard } from './listItem/OracleCard.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { Button } from 'app/App.components/Button/Button.controller'

// styles
import {
  DataFeedsStyled,
  FeedInfo,
  DataFeedValueText,
  DataFeedInfoBlock,
  ContractDetails,
  FeedDetailsChartWrapper,
} from './DataFeedsDetails.style'
import { EmptyContainer } from 'app/App.style'

// consts
import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import {
  PAGINATION_SIDE_RIGHT,
  ORACLES_DATA_IN_FEED_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import colors from 'styles/colors'
import { Page, downColor, skyColor, cyanColor } from 'styles'

// helpers
import { parseDate } from 'utils/time'

// actions
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useSatellitesUpdater } from 'providers/SatellitesProvider/hooks/useSatellitesUpdater'
import { useFeedCharts } from 'providers/DataFeedsProvider/hooks/useFeedCharts'

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

const DataFeedDetails = () => {
  const { search } = useLocation()
  const { feedId } = useParams<{ feedId: string }>()

  const { feedsMapper, registerFeedAction } = useDataFeedsContext()

  const { oraclesIds, satelliteMapper } = useSatellitesContext()
  const { isLoading: isFeedsChartsLoading, dataFeedsHistory, dataFeedsVolatility } = useFeedCharts({}, feedId)

  const { isActionActive } = useSelector((state: State) => state.loading)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const feed = feedsMapper[feedId]

  // Before trusted wias checked like this feed && feed.oraclesResponces >= feed.pct_oracle_threshold
  const [isTrustedAnswer, setTrustedAnswer] = useState(true)

  const [activeTab, setActiveTab] = useState(tabsList[0].id)

  useSatellitesUpdater()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrustedAnswer(
        new Date(feed.last_completed_data_last_updated_at).getTime() + feed.heart_beat_seconds * 1000 >= Date.now(),
      )
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  })

  const chartPlots = (activeTab === 1 ? dataFeedsHistory : dataFeedsVolatility) ?? []

  const feedsSatellites = useMemo(
    () =>
      feedId
        ? oraclesIds
            .filter((address) =>
              satelliteMapper[address].oracleRecords.find(({ feedAddress }) => feedId === feedAddress),
            )
            .map((address) => satelliteMapper[address])
        : [],
    [feedId, oraclesIds, satelliteMapper],
  )

  const paginatedFeedsOracles = useMemo(() => {
    const currentPage = getPageNumber(search, ORACLES_DATA_IN_FEED_LIST_NAME)
    const [from, to] = calculateSlicePositions(currentPage, ORACLES_DATA_IN_FEED_LIST_NAME)
    return feedsSatellites.slice(from, to)
  }, [feedsSatellites, search])

  if (!feed) return <Redirect to={'/data-feeds'} />

  return (
    <Page>
      <PageHeader page={'data-feeds'} />

      <DataFeedsPagination />

      <DataFeedsStyled>
        <div className="top-section-wrapper">
          <FeedInfo>
            <div className="top">
              <div className="name-part">
                <ImageWithPlug imageLink={feed.icon} alt={`${feed.name} logo`} />
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
                  Trigger parameters
                  <CustomTooltip
                    text={`If the price of the asset is volatile and changes more than the set deviation trigger, a new trusted price will be pushed on chain from the oracle. Aside from the deviation trigger, price updates occur on average every 15 minutes.`}
                    iconId={'info'}
                    defaultStrokeColor={colors[themeSelected].textColor}
                    className="info-icon"
                  />
                </h3>

                <h4>Deviation Trigger</h4>

                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.alpha_pct_per_thousand}%
                </DataFeedValueText>
              </DataFeedInfoBlock>

              <DataFeedInfoBlock justifyContent={'space-between'}>
                <h3>
                  Heartbeat
                  <CustomTooltip
                    text={'Countdown until the next set data feed update.'}
                    iconId={'info'}
                    className="info-icon"
                    defaultStrokeColor={colors[themeSelected].textColor}
                  />
                </h3>

                <DataFeedValueText fontSize={16} fontWeidth={600}>
                  {feed.last_completed_data_last_updated_at ? (
                    <div className="timer">
                      <Timer
                        options={{
                          short: true,
                          showZeros: false,
                          negativeColor: downColor,
                          defaultColor: skyColor,
                        }}
                        timestamp={
                          new Date(feed.last_completed_data_last_updated_at).getTime() + feed.heart_beat_seconds * 1000
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
                  {feed.oraclesResponces}%
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
              <Button text="Register" kind={ACTION_PRIMARY} disabled={isActionActive} onClick={registerFeedAction} />
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

          <FeedDetailsChartWrapper>
            <Chart
              data={{ type: AREA_CHART_TYPE, plots: chartPlots }}
              colors={{
                lineColor: cyanColor,
                areaTopColor: cyanColor,
                areaBottomColor: 'rgba(119, 164, 242, 0)',
              }}
              tooltipAsset={activeTab === 1 ? feed.name.split('/')?.[1] : '%'}
            />
          </FeedDetailsChartWrapper>
        </div>

        {paginatedFeedsOracles.length ? (
          <>
            <H2Title>Oracles data</H2Title>

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
    </Page>
  )
}

export default DataFeedDetails
