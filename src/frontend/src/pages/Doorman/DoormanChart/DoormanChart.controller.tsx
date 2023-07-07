import { useSelector } from 'react-redux'
import { useState } from 'react'
import { State } from 'reducers'

// styles
import { DoormanChartCard, DoormanExitFeeCurrentValues, Wrapper } from './DoormanChart.style'

// components
import { Chart } from '../../../app/App.components/Chart/Chart'
import { SlidingTabButtons, TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { cyanColor, skyColor } from 'styles'

import { AREA_CHART_TYPE, AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { MLI_FEE_CHART_DATA } from './MliFee-chart-data'
import { MLI_FEE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { DoubleChart } from 'app/App.components/Chart/ChartTypes/DoubleChart'
import { CommaNumber, formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DECIMALS_TO_SHOW } from 'utils/constants'
import colors from 'styles/colors'
import { SingleValueData, Time } from 'lightweight-charts'
import { calcExitFee, calcMLI } from 'utils/calcFunctions'
import { checkPlotType } from 'app/App.components/Chart/helpers/Chart.const'
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

const tabsList: TabItem[] = [
  {
    text: 'MVK vs. sMVK',
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
  const { smvkHistoryData, mvkHistoryData, totalStakedMvk, totalSupply } = useStakeContext()
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const currentExitFee = calcExitFee(totalSupply, totalStakedMvk)
  const currentMLI = calcMLI(totalSupply, totalStakedMvk)

  const [activeTabId, setActiveTabId] = useState(tabsList[0].id)

  const handleChangeTabs = (tabId?: number) => setActiveTabId(tabsList.find(({ id }) => tabId === id)?.id ?? 1)
  const exitFeeMarkerTime = findExitFeeClosestTimePlot(MLI_FEE_CHART_DATA, currentExitFee)

  return (
    <Wrapper>
      <SlidingTabButtons kind={SECONDARY_SLIDING_TAB_BUTTONS} tabItems={tabsList} onClick={handleChangeTabs} />

      <DoormanChartCard>
        {activeTabId === tabsList[0].id ? (
          <>
            <div className="double-chart-legend">
              <div className="row mvk">
                <div className="circle" /> MVK
              </div>
              <div className="row smvk">
                <div className="circle" /> sMVK
              </div>
            </div>

            <DoubleChart
              firstChart={{
                data: {
                  type: 'area',
                  plots: mvkHistoryData,
                },
                colors: {
                  lineColor: skyColor,
                  areaTopColor: skyColor,
                  areaBottomColor: 'rgba(119, 164, 242, 0.01)',
                },
              }}
              secondChart={{
                data: {
                  type: 'area',
                  plots: smvkHistoryData,
                },
                colors: {
                  lineColor: cyanColor,
                  areaTopColor: cyanColor,
                  areaBottomColor: 'rgba(134, 212, 201, 0.01)',
                },
              }}
              tooltipAssetFirst={'MVK'}
              tooltipAssetSecond={'sMVK'}
              settings={{}}
            />
          </>
        ) : null}
        {activeTabId === tabsList[1].id ? (
          <>
            <DoormanExitFeeCurrentValues>
              <div className="row">
                <div className="name">Current Exit Fee: </div>
                <CommaNumber value={currentExitFee} endingText="%" className="value" />
              </div>
              <div className="row">
                <div className="name">Current MLI: </div>

                <CommaNumber value={currentMLI} className="value" />
              </div>
            </DoormanExitFeeCurrentValues>

            <div className="mli-label">MLI (%)</div>
            <div className="fee-label">Exit Fee(%)</div>
            <Chart
              data={{
                type: AREA_CHART_TYPE,
                plots: MLI_FEE_CHART_DATA,
              }}
              settings={{
                height: 370,
                tickDateFormatter: (timeTick) => formatNumber({ number: timeTick, decimalsToShow: 0 }),
                valueTooltipFormatter: (amount) => formatNumber({ number: amount, decimalsToShow: DECIMALS_TO_SHOW }),
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
                    color: colors[themeSelected].valueColor,
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
          <Chart
            data={{
              type: AREA_CHART_TYPE,
              plots: smvkHistoryData,
            }}
            settings={{
              height: 370,
            }}
            tooltipAsset={'sMVK'}
            numberOfItemsToDisplay={10}
          />
        ) : null}
      </DoormanChartCard>
    </Wrapper>
  )
}
