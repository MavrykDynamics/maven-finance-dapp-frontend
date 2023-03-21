// styles
import { MarketChartsContainer } from 'pages/Loans/Loans.style'

// helpers
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { CHART_COLORS, CHART_SETTINGS } from '../LoansEarnBorrow.consts'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.types'

// types
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'

type Props = {
  // left chart
  leftChartData: AreaChartPlotType[]
  leftChartTitle: string
  leftTotalAmount: number
  // right chart
  rightChartData: AreaChartPlotType[]
  rightChartTitle: string
  rightTotalAmount: number
}

export const EarnBorrowTotalCharts = ({
  // left chart
  leftChartData,
  leftChartTitle,
  leftTotalAmount,
  // right chart
  rightChartData,
  rightChartTitle,
  rightTotalAmount,
}: Props) => {
  const leftPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{leftChartTitle}</span>
        <CommaNumber value={leftTotalAmount ?? 0} beginningText={'$'} />
      </div>

      <div className="chart">
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: leftChartData }}
          colors={CHART_COLORS}
          settings={CHART_SETTINGS}
          numberOfItemsToDisplay={3}
          tooltipAsset="$"
        />
        <div className="chart-interval">30 Days</div>
      </div>
    </div>
  )

  const rightPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{rightChartTitle}</span>
        <CommaNumber value={rightTotalAmount ?? 0} beginningText={'$'} />
      </div>

      <div className="chart">
        <Chart
          data={{ type: AREA_CHART_TYPE, plots: rightChartData }}
          colors={CHART_COLORS}
          settings={CHART_SETTINGS}
          numberOfItemsToDisplay={3}
          tooltipAsset="$"
        />
        <div className="chart-interval">30 Days</div>
      </div>
    </div>
  )

  return (
    <MarketChartsContainer className="earn-borrow-chart">
      {leftPart}
      {rightPart}
    </MarketChartsContainer>
  )
}
