import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useLocation, useParams } from 'react-router-dom'

// types
import { ChartPeriodType } from 'types/charts.type'
import { State } from 'reducers'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.const'

// providers
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'
import { useFeedCharts } from 'providers/DataFeedsProvider/hooks/useFeedCharts'

// view
import DataFeedsPagination from './pagination/DataFeedsPagination.controler'
import { H2Title, H3TitlePrimary, H3TitleSecondary } from 'styles/generalStyledComponents/Titles.style'
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
import { ChartsSwitherWithPosition } from 'app/App.components/ChartsSwitcher'

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
import { DataLoaderWrapper, SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

// consts
import {
  SATELLITE_DATA_SUB,
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITES_DATA_ORACLES_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { ACTION_PRIMARY, ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import {
  PAGINATION_SIDE_RIGHT,
  ORACLES_DATA_IN_FEED_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'
import { SPINNER_LOADER_LARGE } from 'app/App.components/Loader/loader.const'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import colors from 'styles/colors'
import { Page } from 'styles'
import { ONE_HOUR } from 'consts/charts.const'

// helpers
import { getChartXAxisTicks } from 'utils/charts.utils'
import { parseDate } from 'utils/time'
import { SMALL_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import { ALIGN_RIGHT } from 'app/App.components/ChartsSwitcher/chartSwitcher.consts'

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

  const { feedsMapper } = useDataFeedsContext()
  const {
    contractAddresses: { feedsFactoryAddress },
  } = useDappConfigContext()

  const {
    oraclesIds,
    satelliteMapper,
    isLoading: isSatellitesLoading,
    changeSatellitesSubscriptionsList,
  } = useSatellitesContext()
  const [chartPeriod, setChartPeriod] = useState<ChartPeriodType>(ONE_HOUR)
  const { isLoading: isFeedsChartsLoading, dataFeedsHistory, dataFeedsVolatility } = useFeedCharts(feedId, chartPeriod)

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ORACLES_SUB,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  const { isActionActive } = useSelector((state: State) => state.loading)
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const feed = feedsMapper[feedId]

  // Before trusted wias checked like this feed && feed.oraclesResponces >= feed.pct_oracle_threshold
  const [isTrustedAnswer, setTrustedAnswer] = useState(true)

  const [activeTab, setActiveTab] = useState(tabsList[0].id)

  // handlers
  const handlePeriodChange = useCallback((period: ChartPeriodType) => {
    setChartPeriod(period)
  }, [])

  useEffect(() => {
    if (!feed) return
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
            .filter((address) => satelliteMapper[address].participatedFeeds[feedId])
            .map((address) => satelliteMapper[address])
        : [],
    [feedId, oraclesIds, satelliteMapper],
  )

  const paginatedFeedsOracles = useMemo(() => {
    const currentPage = getPageNumber(search, ORACLES_DATA_IN_FEED_LIST_NAME)
    const [from, to] = calculateSlicePositions(currentPage, ORACLES_DATA_IN_FEED_LIST_NAME)
    return feedsSatellites.slice(from, to)
  }, [feedsSatellites, search])

  return (
    <Page>
      <PageHeader page={'data-feeds'} />

      <DataFeedsPagination />

      <DataFeedsStyled>
        {feed ? (
          <>
            <div className="top-section-wrapper">
              <FeedInfo>
                <div className="top">
                  <div className="name-part">
                    <ImageWithPlug imageLink={feed.icon} alt={`${feed.name} logo`} />
                    <div className="text">
                      <div className="name">{feed.name}</div>
                      <a href="https://mavryk.finance/litepaper" target="_blank" rel="noreferrer">
                        Learn how to use {feed.name} in your smart contracts here
                        <CustomTooltip iconId={'question'} defaultStrokeColor={colors[themeSelected].mainHeadingText} />
                      </a>
                    </div>
                  </div>
                  <div className="price-part">
                    <DataFeedValueText fontSize={22} fontWeidth={600} className="shield">
                      <Icon id={isTrustedAnswer ? 'trustShield' : 'notTrustedShield'} />
                      <CommaNumber beginningText="$" value={feed.amount} showDecimal decimalsToShow={6} />
                    </DataFeedValueText>
                    <H3TitleSecondary>
                      {isTrustedAnswer ? 'Trusted Answer' : 'Not Trusted Answer'}
                      <CustomTooltip
                        text={`The current price is ${
                          isTrustedAnswer ? 'trusted' : 'not trusted'
                        } and approved by a majority of the oracles`}
                        iconId={'info'}
                        className="info-icon"
                        defaultStrokeColor={colors[themeSelected].regularText}
                      />
                    </H3TitleSecondary>
                  </div>
                </div>
                <div className="bottom">
                  <DataFeedInfoBlock>
                    <H3TitlePrimary>
                      Trigger parameters
                      <CustomTooltip
                        text={`If the price of the asset is volatile and changes more than the set deviation trigger, a new trusted price will be pushed on chain from the oracle. Aside from the deviation trigger, price updates occur on average every 15 minutes.`}
                        iconId={'info'}
                        defaultStrokeColor={colors[themeSelected].mainHeadingText}
                        className="info-icon opacity-1"
                      />
                    </H3TitlePrimary>

                    <h4>Deviation Trigger</h4>

                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.alpha_pct_per_thousand}%
                    </DataFeedValueText>
                  </DataFeedInfoBlock>

                  <DataFeedInfoBlock justifyContent={'space-between'}>
                    <H3TitleSecondary>
                      Heartbeat
                      <CustomTooltip
                        text={'Countdown until the next set data feed update.'}
                        iconId={'info'}
                        defaultStrokeColor={colors[themeSelected].regularText}
                      />
                    </H3TitleSecondary>

                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.last_completed_data_last_updated_at ? (
                        <div className="timer">
                          <Timer
                            options={{
                              short: true,
                              showZeros: false,
                              negativeColor: colors[themeSelected].downColor,
                              defaultColor: colors[themeSelected].primaryText,
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
                    <H3TitlePrimary>
                      Oracle responses
                      <CustomTooltip
                        className="info-icon opacity-1"
                        text={`The aggregator requires a minimum amount of responses from oracles for the answer to be trusted`}
                        iconId={'info'}
                        defaultStrokeColor={colors[themeSelected].mainHeadingText}
                      />
                    </H3TitlePrimary>
                    <h4>Minimum of {feed.pct_oracle_threshold}%</h4>
                    <DataFeedValueText fontSize={16} fontWeidth={600}>
                      {feed.oraclesResponces}%
                    </DataFeedValueText>
                  </DataFeedInfoBlock>

                  <DataFeedInfoBlock>
                    <H3TitlePrimary>
                      Last update
                      <CustomTooltip
                        text={`Last time the aggregator was updated with a trusted answer and written on-chain`}
                        iconId={'info'}
                        className="info-icon opacity-1"
                        defaultStrokeColor={colors[themeSelected].mainHeadingText}
                      />
                    </H3TitlePrimary>
                    <DataFeedValueText
                      fontSize={14}
                      fontWeidth={500}
                      style={{ padding: '2px 0', color: colors[themeSelected].regularText }}
                    >
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
                  <H3TitlePrimary>
                    Contract address
                    <CustomTooltip
                      text={`Address of this specific data feed`}
                      iconId={'info'}
                      defaultStrokeColor={colors[themeSelected].mainHeadingText}
                      className="opacity-1"
                    />
                  </H3TitlePrimary>
                  <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                    <TzAddress tzAddress={feed.address} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon={true} />
                  </DataFeedValueText>
                </div>
                <div className="info-wrapper">
                  <H3TitlePrimary>
                    Oracle Factory
                    <CustomTooltip
                      text={`Address of the oracle (aggregator) factory which is responsible for creating the aggregator feeds which oracles can sign price feeds for`}
                      iconId={'info'}
                      defaultStrokeColor={colors[themeSelected].mainHeadingText}
                      className="opacity-1"
                    />
                  </H3TitlePrimary>
                  <DataFeedValueText fontSize={14} fontWeidth={600} style={{ lineHeight: '100%' }}>
                    {feedsFactoryAddress ? (
                      <TzAddress tzAddress={feedsFactoryAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon={true} />
                    ) : (
                      '-'
                    )}
                  </DataFeedValueText>
                </div>
                <div className="register-pair-wrapper">
                  <Button
                    text="Register"
                    kind={ACTION_PRIMARY}
                    disabled={isActionActive || true}
                    onClick={() => console.log('implement')}
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

              <FeedDetailsChartWrapper>
                <ChartsSwitherWithPosition
                  currentPeriod={chartPeriod}
                  setCurrentPeriod={handlePeriodChange}
                  size={SMALL_SLIDING_TAB_BUTTONS}
                  space={15}
                  align={ALIGN_RIGHT}
                />
                {isFeedsChartsLoading ? (
                  <DataLoaderWrapper margin="0">
                    <SpinnerCircleLoaderStyled className={SPINNER_LOADER_LARGE} />
                    <div className="text">Loading feed history data</div>
                  </DataLoaderWrapper>
                ) : (
                  <Chart
                    isLoading={isFeedsChartsLoading}
                    numberOfItemsToDisplay={2}
                    data={{ type: AREA_CHART_TYPE, plots: chartPlots }}
                    colors={{
                      lineColor: colors[themeSelected].primaryChartColor,
                      areaTopColor: colors[themeSelected].primaryChartColor,
                      areaBottomColor: colors[themeSelected].primaryChartBottomColor,
                    }}
                    tooltipAsset={activeTab === 1 ? feed.name.split('/')?.[1] : '%'}
                    settings={{ tickDateFormatter: (date: number) => getChartXAxisTicks(date, chartPeriod) }}
                  />
                )}
              </FeedDetailsChartWrapper>
            </div>

            <H2Title>Oracles data</H2Title>
            {isSatellitesLoading ? (
              <DataLoaderWrapper>
                <SpinnerCircleLoaderStyled className={SPINNER_LOADER_LARGE} />
                <div className="text">Loading oracles data</div>
              </DataLoaderWrapper>
            ) : paginatedFeedsOracles.length ? (
              <div className={`oracles-list`}>
                {feedsSatellites.map((item) => (
                  <OracleCard oracle={item} key={item.address} feed={feed} />
                ))}

                <Pagination
                  itemsCount={feedsSatellites.length}
                  side={PAGINATION_SIDE_RIGHT}
                  listName={ORACLES_DATA_IN_FEED_LIST_NAME}
                />
              </div>
            ) : (
              <EmptyContainer>
                <img src="/images/not-found.svg" alt=" No proposals to show" />
                <figcaption> No oracles to show</figcaption>
              </EmptyContainer>
            )}
          </>
        ) : (
          <EmptyContainer>
            <img src="/images/not-found.svg" alt=" No feed to show" />
            <figcaption>Feed with address ({feedId}) does not exist</figcaption>
          </EmptyContainer>
        )}
      </DataFeedsStyled>
    </Page>
  )
}

export default DataFeedDetails
