// components
import { Chart, ChartPlotType } from '../../../app/App.components/Chart/Chart.view'

// styles
import { ChartCard } from './DataFeedsChart.style'

// types;
import { cyanColor } from 'styles'

type Props = {
  dataFeedsHistory: ChartPlotType[]
  dataFeedsVolatility: ChartPlotType[]
  className?: string
  tooltipAsset: string
  activeTab: number
}

export function DataFeedsChart({ className, dataFeedsHistory, dataFeedsVolatility, activeTab, tooltipAsset }: Props) {
  // const tickFormater = (value: number): string => {
  //   return activeTab === 1
  //     ? `$${formatNumber(true, DECIMALS_TO_SHOW, value)}`
  //     : `${formatNumber(true, DECIMALS_TO_SHOW, value)}%`
  // }

  const shownData = activeTab === 1 ? dataFeedsHistory : dataFeedsVolatility

  return (
    <ChartCard className={className}>
      <Chart
        data={shownData}
        colors={{
          lineColor: cyanColor,
          areaTopColor: cyanColor,
          areaBottomColor: 'rgba(119, 164, 242, 0)',
          textColor: '#CDCDCD',
        }}
        settings={{
          height: 300,
          tooltipAsset: activeTab === 1 ? tooltipAsset : '%',
        }}
        className="data-feeds-chart"
      />
    </ChartCard>
  )
}
