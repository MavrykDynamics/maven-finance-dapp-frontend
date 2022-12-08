import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// styles
import { ChartCard, Wrapper } from './DoormanChart.style'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// components
import { Chart } from '../../../app/App.components/Chart/Chart.view'
import { TabItem } from '../../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { cyanColor } from 'styles'
import { CHART_TEST_DATA } from 'pages/DashboardPersonal/tabs.const'
import { DECIMALS_TO_SHOW } from 'utils/constants'

type Props = {
  className?: string
}

const tabsList: TabItem[] = [
  {
    text: 'MVK Total Supply',
    id: 1,
    active: true,
  },
  {
    text: 'Staking History',
    id: 2,
    active: false,
  },
]

export function DoormanChart({ className }: Props) {
  const { mvkMintHistoryData, smvkHistoryData } = useSelector((state: State) => state.doorman)

  const [activeTab, setActiveTab] = useState(tabsList[0].text)
  const isStakingHistory = activeTab === tabsList[1].text

  const handleChangeTabs = (tabId?: number) => {
    setActiveTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }

  const valueFormatter =
    (label: string) =>
    (value: number): string =>
      `${formatNumber(true, DECIMALS_TO_SHOW, value)}${label}`

  const shownData = isStakingHistory ? smvkHistoryData : mvkMintHistoryData

  return (
    <Wrapper>
      {tabsList?.length ? <TabSwitcher className="switcher" tabItems={tabsList} onClick={handleChangeTabs} /> : null}

      <ChartCard>
        <Chart
          data={shownData}
          colors={{
            lineColor: cyanColor,
            areaTopColor: cyanColor,
            areaBottomColor: 'rgba(119, 164, 242, 0)',
            textColor: '#CDCDCD',
          }}
          settings={{
            height: 370,
          }}
          numberOfItemsToDisplay={10}
          className="dorman-chart"
        />
      </ChartCard>
    </Wrapper>
  )
}
