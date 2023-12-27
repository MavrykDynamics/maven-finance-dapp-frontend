import { useState } from 'react'
import { SingleValueData, Time } from 'lightweight-charts'

// components
import { ChartsSwitcherWithPosition } from 'app/App.components/ChartsSwitcher'
import { DoubleChart } from 'app/App.components/Chart/ChartTypes/DoubleChart'
import { DoormanChartCard, DoormanExitFeeCurrentValues, Wrapper } from './DoormanChart.style'
import { Chart } from '../../../app/App.components/Chart/Chart'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// hooks
import { useDoormanHistory } from 'providers/DoormanProvider/hooks/useDoormanHistory'
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// consts
import { CommaNumber, formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ONE_HOUR } from 'consts/charts.const'
import colors from 'styles/colors'
import { ALIGN_RIGHT } from 'app/App.components/ChartsSwitcher/chartSwitcher.consts'
import { MLI_FEE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { DECIMALS_TO_SHOW } from 'utils/constants'
import { AREA_CHART_TYPE, checkPlotType } from 'app/App.components/Chart/helpers/Chart.const'
import { MLI_FEE_CHART_DATA } from './MliFee-chart-data'
import {
  SECONDARY_SLIDING_TAB_BUTTONS,
  SMALL_SLIDING_TAB_BUTTONS,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

// types
import { ChartPeriodType } from 'types/charts.type'
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

// utils
import { calcExitFee, calcMLI } from 'utils/calcFunctions'
import { getChartXAxisTicks } from 'utils/charts.utils'

const tabsList: SlidingTabButtonType[] = [
  {
    text: 'MVN vs. sMVN',
    id: 1,
    active: true,
  },
  {
    text: 'MLI and Exit Fee',
    id: 2,
    active: false,
  },
  {
    text: 'Staking History',
    id: 3,
    active: false,
  },
]

const findExitFeeClosestTimePlot = (exitFeePlots: Array<AreaChartPlotType>, exitFeeValue: number): Time => {
  const { smallesDiffTime } = exitFeePlots.reduce<{ diff: number; smallesDiffTime: Time }>(
    (acc, plot) => {
      if (!checkPlotType<SingleValueData>(plot, ['value'])) return acc
      const { value, time } = plot

      const timeDiff = Math.abs(value - exitFeeValue)

      if (timeDiff < acc.diff) {
        acc.diff = timeDiff
        acc.smallesDiffTime = time
      }

      return acc
    },
    {
      diff: Math.abs(Number(exitFeePlots[0].time) - exitFeeValue),
      smallesDiffTime: exitFeePlots[0].time,
    },
  )

  return smallesDiffTime
}

export function DoormanChart() {
  const { totalStakedMvn, totalSupply } = useDoormanContext()
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const currentExitFee = calcExitFee(totalSupply, totalStakedMvn)
  const currentMLI = calcMLI(totalSupply, totalStakedMvn)

  const [chartPeriod, setChartPeriod] = useState<ChartPeriodType>(ONE_HOUR)
  const {
    smvnHistoryData,
    mvnHistoryData,
    isLoading: isChartsDataLoading,
    noChartData,
  } = useDoormanHistory(chartPeriod)

  const [activeTabId, setActiveTabId] = useState(tabsList[0].id)

  const handleChangeTabs = (tabId?: number) => setActiveTabId(tabsList.find(({ id }) => tabId === id)?.id ?? 1)

  const exitFeeMarkerTime = findExitFeeClosestTimePlot(MLI_FEE_CHART_DATA, currentExitFee)
  const numberOfItemsToDisplay = smvnHistoryData.length < 10 && !noChartData ? smvnHistoryData.length : 10

  return (
    <Wrapper>
      <SlidingTabButtons kind={SECONDARY_SLIDING_TAB_BUTTONS} tabItems={tabsList} onClick={handleChangeTabs} />

      <DoormanChartCard isExitFeeChart={activeTabId === tabsList[1].id}>
        {activeTabId === tabsList[0].id ? (
          <>
            <ChartsSwitcherWithPosition
              currentPeriod={chartPeriod}
              setCurrentPeriod={setChartPeriod}
              size={SMALL_SLIDING_TAB_BUTTONS}
              align={ALIGN_RIGHT}
              space={15}
            />
            <div className="double-chart-legend">
              <div className="row mvn">
                <div className="circle" />
                MVN
              </div>
              <div className="row smvn">
                <div className="circle" />
                sMVN
              </div>
            </div>

            <DoubleChart
              isLoading={isChartsDataLoading}
              numberOfItemsToDisplay={numberOfItemsToDisplay}
              firstChart={{
                data: {
                  type: 'area',
                  plots: mvnHistoryData,
                },
                colors: {
                  lineColor: colors[themeSelected].primaryChartColor,
                  areaTopColor: colors[themeSelected].primaryChartTopColor,
                  areaBottomColor: colors[themeSelected].primaryChartBottomColor,
                },
              }}
              secondChart={{
                data: {
                  type: 'area',
                  plots: smvnHistoryData,
                },
                colors: {
                  lineColor: colors[themeSelected].secondaryChartColor,
                  areaTopColor: colors[themeSelected].secondaryChartTopColor,
                  areaBottomColor: colors[themeSelected].secondaryChartBottomColor,
                },
              }}
              tooltipAssetFirst={'MVK'}
              tooltipAssetSecond={'sMVK'}
              settings={{
                height: 370,
                tickDateFormatter: (date: number) => getChartXAxisTicks(date, chartPeriod),
              }}
            />
          </>
        ) : null}
        {activeTabId === tabsList[1].id ? (
          <>
            <DoormanExitFeeCurrentValues>
              <div className="row">
                <div className="name">Current Exit Fee:</div>
                <CommaNumber value={currentExitFee} endingText="%" className="value" />
              </div>
              <div className="row">
                <div className="name">Current MLI:</div>

                <CommaNumber value={currentMLI} className="value" />
              </div>
            </DoormanExitFeeCurrentValues>

            <div className="mli-label chart-legend">MLI (%)</div>
            <div className="fee-label">Exit Fee(%)</div>
            <Chart
              data={{
                type: AREA_CHART_TYPE,
                plots: MLI_FEE_CHART_DATA,
              }}
              settings={{
                height: 380,
                tickDateFormatter: (timeTick) => formatNumber({ number: timeTick, decimalsToShow: 0 }),
                valueTooltipFormatter: (amount) =>
                  formatNumber({
                    number: amount,
                    decimalsToShow: DECIMALS_TO_SHOW,
                  }),
                // as data is static we can set margins we want, but if data will change we will need to check those margins
                priceMargins: { top: 0.61, bottom: 0.01 },
                yAxisSide: 'left',
                crosshairOptions: {
                  vertLine: {
                    labelVisible: false,
                  },
                  horzLine: {
                    labelVisible: false,
                  },
                },
                seriesMarkers: [
                  {
                    time: exitFeeMarkerTime,
                    position: 'inBar',
                    color: colors[themeSelected].primaryChartColor,

                    shape: 'circle',
                  },
                ],
              }}
              tooltipAsset={'%'}
              tooltipName={MLI_FEE_TOOLTIP}
            />
          </>
        ) : null}

        {activeTabId === tabsList[2].id ? (
          <>
            <ChartsSwitcherWithPosition
              currentPeriod={chartPeriod}
              setCurrentPeriod={setChartPeriod}
              size={SMALL_SLIDING_TAB_BUTTONS}
              align={ALIGN_RIGHT}
              space={15}
            />
            <Chart
              isLoading={isChartsDataLoading}
              data={{
                type: AREA_CHART_TYPE,
                plots: smvnHistoryData,
              }}
              settings={{
                height: 370,
                tickDateFormatter: (date: number) => getChartXAxisTicks(date, chartPeriod),
              }}
              tooltipAsset={'sMVK'}
              // check is there is a dat for chart, if no - show default chart text
              numberOfItemsToDisplay={numberOfItemsToDisplay}
            />
          </>
        ) : null}
      </DoormanChartCard>
    </Wrapper>
  )
}
