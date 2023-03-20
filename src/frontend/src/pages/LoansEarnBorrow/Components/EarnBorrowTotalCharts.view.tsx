// styles
import { MarketChartsContainer } from 'pages/Loans/Loans.style'

// helpers
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Chart } from 'app/App.components/Chart/Chart.view'
import { CHART_COLORS, CHART_SETTINGS } from '../LoansEarnBorrow.consts'

// types
import { LoansChartsDataType } from 'utils/TypesAndInterfaces/Loans'

type Props = {
  chartsData: LoansChartsDataType // TODO: temporary type
  leftChartTitle: string
  rightChartTitle: string
}

export const EarnBorrowTotalCharts = ({ chartsData, leftChartTitle, rightChartTitle }: Props) => {
  const earningPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{leftChartTitle}</span>
        <CommaNumber value={chartsData?.totalLended ?? 0} beginningText={'$'} />
      </div>
      <Chart
        data={chartsData.lendingChartData}
        colors={CHART_COLORS}
        className="loan-chart"
        settings={CHART_SETTINGS}
        numberOfItemsToDisplay={3}
      >
        <div className="chart-interval">30 Days</div>
      </Chart>
    </div>
  )

  const borrowingPart = (
    <div className="chart-wrapper">
      <div className="summary">
        <span>{rightChartTitle}</span>
        <CommaNumber value={chartsData?.totalBorrowed ?? 0} beginningText={'$'} />
      </div>
      <Chart
        data={chartsData.borrowingChartData}
        colors={CHART_COLORS}
        className="loan-chart"
        settings={CHART_SETTINGS}
        numberOfItemsToDisplay={3}
      >
        <div className="chart-interval">30 Days</div>
      </Chart>
    </div>
  )

  return (
    <MarketChartsContainer className="largeGap">
      {earningPart}
      {borrowingPart}
    </MarketChartsContainer>
  )
}
