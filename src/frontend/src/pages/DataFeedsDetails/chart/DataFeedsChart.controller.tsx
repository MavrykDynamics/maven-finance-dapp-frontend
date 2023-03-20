// components
import { Chart } from '../../../app/App.components/Chart/Chart'

// styles
import { ChartCard } from './DataFeedsChart.style'
import { cyanColor } from 'styles'

// types;
import { AreaChartPlotType } from 'app/App.components/Chart/Chart.types'

type Props = {
  dataFeedsHistory: AreaChartPlotType[]
  dataFeedsVolatility: AreaChartPlotType[]
  className?: string
  tooltipAsset: string
  activeTab: number
}

export function DataFeedsChart({ className, dataFeedsHistory, dataFeedsVolatility, activeTab, tooltipAsset }: Props) {
  const plots = activeTab === 1 ? dataFeedsHistory : dataFeedsVolatility

  return (
    <ChartCard className={className}>
      <Chart
        data={{ type: 'area', plots }}
        colors={{
          lineColor: cyanColor,
          areaTopColor: cyanColor,
          areaBottomColor: 'rgba(119, 164, 242, 0)',
          textColor: '#CDCDCD',
        }}
        settings={{
          height: 300,
          // tooltipAsset: activeTab === 1 ? tooltipAsset : '%',
        }}
        className="data-feeds-chart"
        tooltipAsset={tooltipAsset}
      />
    </ChartCard>
  )
}
