import { useSelector } from 'react-redux'
import { useMemo, useState } from 'react'
import { State } from 'reducers'

// styles
import { ChartCard, Wrapper } from './DoormanChart.style'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// components
import { Chart } from '../../../app/App.components/Chart/Chart'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { cyanColor } from 'styles'

const tabsList: TabItem[] = [
  {
    text: 'Circulating MVK vs. sMVK',
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

const exitFeeMliData = JSON.parse()

export function DoormanChart() {
  const { smvkHistoryData, mvkMintHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTabId, setActiveTabId] = useState(tabsList[0].id)

  const handleChangeTabs = (tabId?: number) => setActiveTabId(tabsList.find(({ id }) => tabId === id)?.id ?? 1)

  const { plots, tooltipAsset } = useMemo(() => {
    switch (activeTabId) {
      // return double chart data
      case tabsList[0].id:
        return { plots: [], tooltipAsset: 'sMVK' }
      // return MLI & exit fee chart data
      case tabsList[1].id:
        return { plots: [], tooltipAsset: 'sMVK' }
      // return sMVK chart data
      case tabsList[2].id:
        return { plots: smvkHistoryData, tooltipAsset: 'sMVK' }
      default:
        return { plots: [], tooltipAsset: '' }
    }
  }, [smvkHistoryData, activeTabId])

  return (
    <Wrapper>
      {tabsList?.length ? <TabSwitcher className="switcher" tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <ChartCard>
        <Chart
          data={{ type: 'area', plots }}
          colors={{
            lineColor: cyanColor,
            areaTopColor: cyanColor,
            areaBottomColor: 'rgba(119, 164, 242, 0)',
            textColor: '#CDCDCD',
          }}
          settings={{
            height: 370,
          }}
          tooltipAsset={tooltipAsset}
        />
      </ChartCard>
    </Wrapper>
  )
}
