// styles
import { Plug } from './Chart.style'

// components
import Icon from '../Icon/Icon.view'
import { AreaChart } from './ChartTypes/AreaChart'
import { CandlestickChart } from './ChartTypes/CandlestickChart'

import { ChartWrapperPropsType } from './helpers/Chart.types'
import { HistogramChart } from './ChartTypes/HistogramChart'

export const Chart = ({
  data,
  colors,
  settings,
  numberOfItemsToDisplay = 15,
  tooltipName,
  tooltipAsset,
}: ChartWrapperPropsType) => {
  if (data.plots.length < numberOfItemsToDisplay) {
    return (
      <Plug>
        <div>
          <Icon id="stars" className="icon-stars" />
          <Icon id="cow" className="icon-cow" />
        </div>

        <p>There is not enough data to display the chart</p>
      </Plug>
    )
  }

  if (data.type === 'area')
    return (
      <AreaChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  if (data.type === 'candle')
    return (
      <CandlestickChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  if (data.type === 'histogram')
    return (
      <HistogramChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  return null
}
