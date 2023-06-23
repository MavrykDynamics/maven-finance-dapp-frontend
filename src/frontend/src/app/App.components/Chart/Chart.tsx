// styles
import { Plug } from './Chart.style'

// components
import Icon from '../Icon/Icon.view'
import { AreaChart } from './ChartTypes/AreaChart'
import { CandlestickChart } from './ChartTypes/CandlestickChart'
import { HistogramChart } from './ChartTypes/HistogramChart'

import {
  AREA_CHART_TYPE,
  CANDLESTICK_CHART_TYPE,
  ChartWrapperPropsType,
  HISTOGRAM_CHART_TYPE,
} from './helpers/Chart.types'

/**
 *
 * Chart component
 * To add new prop you will need to add it to type and then add usage of this props in chart type component you need (preferred to add to all types)
 * To add new chart type you will need to add data type for it and create new chart type component, cuz styling and data setting is different between types
 *
 * @colors supports:
 *     --------- AREA COLORS ---------
 *    @lineColor -> area line above gradient
 *    @areaTopColor -> top area gradient part
 *    @areaBottomColor -> bottom area gradient part
 *     --------- CANDLESTICK COLORS ---------
 *    @chandleUpColor -> candle up color
 *    @chandleDownColor -> candle down color
 *     --------- HIISTOGRAM COLORS ---------
 *    @barColor -> bar color for histogram chart
 *    --------- GENERAL COLORS ---------
 *    @textColor -> text color for axises labels
 *    @borderColor -> border color for axises
 *
 * @settings supports:
 *    @height -> height of the chart (if not set will take 100% of parent)
 *    @width -> width of the chart (if not set will take 100% of parent)
 *    @hideXAxis -> hide xAxis
 *    @hideYAxis -> hide yAxis
 *    @yAxisSide -> 'left' | 'right' side where yAxis will be displayed
 *    @priceMargins -> padding from top and bottom on yAxis, not in px
 *    @crosshairOptions -> disable one | two of the default labels and head lines when hovering the chart
 *    @tickDateFormatter -> custom formatter for xAxis labels
 *    @dateTooltipFormatter -> custom formatter for date in tooltip
 *    @valueTooltipFormatter -> custom formatter for amount in tooltip
 *
 * @data -> array of plots according to the chart type & type of the chart
 *
 * @tooltipName ->  type of the tooltip (to add new just add new type and add new case in switch statement inside the @ChartTooltip)
 * @tooltipAsset -> asset that will apply to the amount in tooltip
 *
 * @numberOfItemsToDisplay -> if we have less plots than this amount show plug
 *
 * to use chart you need to create a wrapper to position it (and if you need you can specify size for wrapped and ignore height and width props),
 * then you need to pass only data prop, and based on the situation you can use @colors & @settings to custom it
 *
 * TODO: add dynamic colors (pass color name and use it dynamic via colors[theme][colorNameFromProp])
 * TODO: if need add custom formatter for yAxis, problem is fantom decimals
 *
 */
export const Chart = ({
  data,
  colors,
  settings,
  numberOfItemsToDisplay = 15,
  tooltipName,
  tooltipAsset,
  comingSoon = false,
}: ChartWrapperPropsType) => {
  if (comingSoon) {
    return (
      <Plug>
        <div>
          <Icon id="stars" className="icon-stars" />
          <Icon id="cow" className="icon-cow" />
        </div>

        <p>Coming soon</p>
      </Plug>
    )
  }

  if (data.plots.length < numberOfItemsToDisplay) {
    return (
      <Plug className='chartPlug'>
        <div>
          <Icon id="stars" className="icon-stars" />
          <Icon id="cow" className="icon-cow" />
        </div>

        <p>There is not enough data to display the chart</p>
      </Plug>
    )
  }

  if (data.type === AREA_CHART_TYPE)
    return (
      <AreaChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  if (data.type === CANDLESTICK_CHART_TYPE)
    return (
      <CandlestickChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  if (data.type === HISTOGRAM_CHART_TYPE)
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
