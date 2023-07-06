import { CandlestickData, SeriesMarker, SingleValueData, Time, WhitespaceData } from 'lightweight-charts'
import { ChartTooltipsTypes } from '../Tooltips/ChartTooltip'
import { DoubleChartTooltipsTypes } from '../Tooltips/DoubleChartTooltip'

// Chart types
export const AREA_CHART_TYPE = 'area'
export const CANDLESTICK_CHART_TYPE = 'candle'
export const HISTOGRAM_CHART_TYPE = 'histogram'

// Chart data prot types
export type AreaChartPlotType = SingleValueData | WhitespaceData
export type CandlestickChartPlotType = CandlestickData | WhitespaceData

export type ChartColorsSettings = {
  // area colors
  lineColor?: string
  areaTopColor?: string
  areaBottomColor?: string

  // candlestick colors
  chandleUpColor?: string
  chandleDownColor?: string

  // histogram colors
  barColor?: string
}

type ChartSettings = {
  height?: number
  width?: number
  tickDateFormatter?: (date: number) => string
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  hideXAxis?: boolean
  hideYAxis?: boolean
  yAxisSide?: 'left' | 'right'
  priceMargins?: { top: number; bottom: number }
  crosshairOptions?: {
    vertLine?: {
      visible?: boolean
      labelVisible?: boolean
    }
    horzLine?: {
      visible?: boolean
      labelVisible?: boolean
    }
  }
  textColor?: string
  borderColor?: string
}

// Base chart props, that are general to all types
type ChartBasePropsType = {
  colors?: ChartColorsSettings
  settings?: ChartSettings & {
    seriesMarkers?: SeriesMarker<Time>[]
  }
  tooltipName?: ChartTooltipsTypes
  tooltipAsset: string
}

// AREA and HISTOGRAM chart props
export type AreaChartPropsType = ChartBasePropsType & {
  data: Array<AreaChartPlotType>
}

// CANDLESTICK chart props
export type CandleStickPropsType = ChartBasePropsType & {
  data: Array<CandlestickChartPlotType>
}

// Chart wrapper props
export type ChartWrapperPropsType = ChartBasePropsType & {
  data:
    | {
        type: typeof AREA_CHART_TYPE
        plots: Array<AreaChartPlotType>
      }
    | {
        type: typeof CANDLESTICK_CHART_TYPE
        plots: Array<CandlestickChartPlotType>
      }
    | {
        type: typeof HISTOGRAM_CHART_TYPE
        plots: Array<AreaChartPlotType>
      }

  numberOfItemsToDisplay?: number
  tooltipName?: ChartTooltipsTypes
  tooltipAsset: string
  comingSoon?: boolean
}

// Double chart props

type DoubleChartColorsType = {
  // area colors
  lineColor?: string
  areaTopColor?: string
  areaBottomColor?: string

  // candlestick colors
  chandleUpColor?: string
  chandleDownColor?: string

  // histogram colors
  barColor?: string
}

export type DoubleChartPropsType = {
  firstChart: {
    data:
      | {
          type: typeof AREA_CHART_TYPE
          plots: Array<AreaChartPlotType>
        }
      | {
          type: typeof CANDLESTICK_CHART_TYPE
          plots: Array<CandlestickChartPlotType>
        }
      | {
          type: typeof HISTOGRAM_CHART_TYPE
          plots: Array<AreaChartPlotType>
        }
    colors: DoubleChartColorsType
  }
  secondChart: {
    data:
      | {
          type: typeof AREA_CHART_TYPE
          plots: Array<AreaChartPlotType>
        }
      | {
          type: typeof CANDLESTICK_CHART_TYPE
          plots: Array<CandlestickChartPlotType>
        }
      | {
          type: typeof HISTOGRAM_CHART_TYPE
          plots: Array<AreaChartPlotType>
        }
    colors: DoubleChartColorsType
  }

  settings: ChartSettings & {
    firstChartSeriesMarkers?: SeriesMarker<Time>[]
    secondChartSeriesMarkers?: SeriesMarker<Time>[]
  }
  tooltipName?: DoubleChartTooltipsTypes
  tooltipAssetFirst: string
  tooltipAssetSecond: string
}

// Pie chart types
export type PieChartDataType = Array<{
  title: string
  value: number
  color: string
  labelPersent: number
  segmentStroke: number
  isHoveredPathAsset: boolean
  groupedSmall: boolean
}>
