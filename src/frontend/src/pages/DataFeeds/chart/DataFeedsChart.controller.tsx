// components
import { Chart } from '../../../app/App.components/Chart/Chart.view'

// styles
import { ChartCard } from './DataFeedsChart.style'

// types
import { DataFeedsHistory, DataFeedsVolatility } from '../../Satellites/helpers/Satellites.types'
import { formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { cyanColor } from 'styles'
import { DECIMALS_TO_SHOW } from 'utils/constants'
import { parseDate } from 'utils/time'
import dayjs from 'dayjs'

type Props = {
  dataFeedsHistory: DataFeedsHistory
  dataFeedsVolatility: DataFeedsVolatility
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
          tooltipAsset,
        }}
        className="data-feeds-chart"
      />
    </ChartCard>
  )
}
