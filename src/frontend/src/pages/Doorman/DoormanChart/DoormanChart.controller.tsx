import { useSelector } from 'react-redux'
import { useState } from 'react'
import { State } from 'reducers'

// styles
import { DoormanChartCard, Wrapper } from './DoormanChart.style'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// components
import { Chart } from '../../../app/App.components/Chart/Chart'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { cyanColor, skyColor } from 'styles'

import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'
import { MLI_FEE_CHART_DATA } from './MliFee-chart-data'
import { MLI_FEE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { DoubleChart } from 'app/App.components/Chart/ChartTypes/DoubleChart'
import { formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DECIMALS_TO_SHOW } from 'utils/constants'

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

export function DoormanChart() {
  const { smvkHistoryData, mvkHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTabId, setActiveTabId] = useState(tabsList[0].id)

  const handleChangeTabs = (tabId?: number) => setActiveTabId(tabsList.find(({ id }) => tabId === id)?.id ?? 1)

  return (
    <Wrapper>
      {tabsList?.length ? <TabSwitcher className="switcher" tabItems={tabsList} onClick={handleChangeTabs} /> : null}

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
                priceMargins: { top: 0.72, bottom: 0.01 },
                yAxisSide: 'left',
                crosshairOptions: {
                  vertLine: {
                    labelVisible: false,
                  },
                  horzLine: {
                    labelVisible: false,
                  },
                },
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
