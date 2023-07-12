// styles
import { MarketChartsContainer } from 'pages/Loans/Loans.style'

// helpers
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart'
import { CHART_COLORS, CHART_SETTINGS, numberOfItemsToDisplay } from '../LoansEarnBorrow.consts'
import { AREA_CHART_TYPE } from 'app/App.components/Chart/helpers/Chart.const'
import { CURRENCY_AMOUNT_DATE_TOOLTIP } from 'app/App.components/Chart/Tooltips/ChartTooltip'
import { getChartDataBasedOnLength, getChartSettingsBasedOnChartLength } from 'pages/Loans/Loans.helpers'

// types
import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { useLoansEarnBorrowContext } from '../context/loansEarnBorrowContext'

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
  const { isChartsLoading } = useLoansEarnBorrowContext()

  const leftPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{leftChartTitle}</span>
        <CommaNumber value={leftTotalAmount ?? 0} beginningText={'$'} />
      </div>

      <div className={'chart'}>
        <Chart
          isLoading={isChartsLoading}
          data={{ type: AREA_CHART_TYPE, plots: getChartDataBasedOnLength(leftChartData, 7) }}
          colors={CHART_COLORS}
          settings={getChartSettingsBasedOnChartLength(leftChartData, CHART_SETTINGS)}
          numberOfItemsToDisplay={numberOfItemsToDisplay}
          tooltipAsset="$"
          tooltipName={CURRENCY_AMOUNT_DATE_TOOLTIP}
        />
        <div className="chart-interval">7 Days</div>
      </div>
    </div>
  )

  const rightPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{rightChartTitle}</span>
        <CommaNumber value={rightTotalAmount ?? 0} beginningText={'$'} />
      </div>

      <div className={'chart'}>
        <Chart
          isLoading={isChartsLoading}
          data={{ type: AREA_CHART_TYPE, plots: getChartDataBasedOnLength(rightChartData, 7) }}
          colors={CHART_COLORS}
          settings={getChartSettingsBasedOnChartLength(rightChartData, CHART_SETTINGS)}
          numberOfItemsToDisplay={numberOfItemsToDisplay}
          tooltipAsset="$"
          tooltipName={CURRENCY_AMOUNT_DATE_TOOLTIP}
        />
        <div className="chart-interval">7 Days</div>
      </div>
    </div>
  )

  return (
    <MarketChartsContainer>
      {leftPart}
      {rightPart}
    </MarketChartsContainer>
  )
}
