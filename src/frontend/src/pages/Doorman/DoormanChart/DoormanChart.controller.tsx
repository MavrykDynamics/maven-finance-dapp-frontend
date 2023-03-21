import { useSelector } from 'react-redux'
import { useMemo, useState } from 'react'
import { State } from 'reducers'

// styles
import { DoormanChartCard, Wrapper } from './DoormanChart.style'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// components
import { Chart } from '../../../app/App.components/Chart/Chart'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { cyanColor } from 'styles'

import { AreaChartPlotType, AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'
import { MLI_FEE_CHART_DATA } from './MliFee-chart-data'
import { CHART_TEST_DATA } from 'pages/DashboardPersonal/tabs.const'
import { MLI_FEE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'

const tabsList: TabItem[] = [
  // {
  //   text: 'MVK vs. sMVK',
  //   id: 1,
  //   active: true,
  // },
  {
    text: 'MLI and Exit Fee',
    id: 2,
    active: true,
  },
  {
    text: 'Staking History',
    id: 3,
    active: false,
  },
]

export function DoormanChart() {
  const { smvkHistoryData, mvkMintHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTabId, setActiveTabId] = useState(tabsList[0].id)

  const handleChangeTabs = (tabId?: number) => setActiveTabId(tabsList.find(({ id }) => tabId === id)?.id ?? 1)

  return (
    <Wrapper>
      {tabsList?.length ? <TabSwitcher className="switcher" tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <DoormanChartCard>
        {/* {activeTabId === tabsList[0].id ? null : null} */}
        {activeTabId === tabsList[0].id ? (
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
                tickDateFormatter: (timeTick) => timeTick.toFixed(0),
                priceMargins: { top: 0.1, bottom: 0.01 },
                yAxisSide: 'left',
                crosshairOptions: {
                  vertLine: {
                    visible: true,
                    labelVisible: false,
                  },
                },
              }}
              tooltipAsset={'%'}
              tooltipName={MLI_FEE_TOOLTIP}
            />
          </>
        ) : null}

        {activeTabId === tabsList[1].id ? (
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
