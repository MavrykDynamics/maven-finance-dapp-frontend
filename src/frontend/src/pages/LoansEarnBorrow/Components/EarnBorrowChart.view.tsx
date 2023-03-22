import { useState } from 'react'

// components
import { Chart } from 'app/App.components/Chart/Chart'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { EarnBorrowChartStyled } from '../LoansEarnBorrow.styles'

// helpers
import { CHART_COLORS, MINI_CHART_SETTINGS } from '../LoansEarnBorrow.consts'
import { BUTTON_THIRD, BUTTON_ROUND } from 'app/App.components/Button/Button.constants'
import { AREA_CHART_TYPE, HISTOGRAM_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'

// types
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

const numberOfItemsToDisplay = 3

type ChartDataType = {
  type: typeof AREA_CHART_TYPE | typeof HISTOGRAM_CHART_TYPE
  plots: AreaChartPlotType[]
}

type Props = {
  data: AreaChartPlotType[]
}

export const EarnBorrowChart = ({ data }: Props) => {
  const [isGraph, setIsGraph] = useState(false)

  const chartData: ChartDataType = { type: isGraph ? HISTOGRAM_CHART_TYPE : AREA_CHART_TYPE, plots: data }
  const showChart = chartData.plots.length >= numberOfItemsToDisplay

  return (
    <EarnBorrowChartStyled className={isGraph ? 'isGraph' : ''}>
      {showChart && (
        <div className="switchMenu">
          <span>Supply Vol / 14 Days</span>

          <Button kind={BUTTON_THIRD} form={BUTTON_ROUND} onClick={() => setIsGraph(!isGraph)}>
            <Icon id={isGraph ? 'graph' : 'chart'} />
          </Button>
        </div>
      )}

      <Chart
        data={chartData}
        colors={CHART_COLORS}
        settings={MINI_CHART_SETTINGS}
        numberOfItemsToDisplay={numberOfItemsToDisplay}
        tooltipAsset="$"
      />
    </EarnBorrowChartStyled>
  )
}
