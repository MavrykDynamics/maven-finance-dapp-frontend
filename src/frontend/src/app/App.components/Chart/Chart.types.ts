import { CandlestickData, SingleValueData, UTCTimestamp } from 'lightweight-charts'
import { CHART_TOOLTIPS_TYPE } from './Tooltips/ChartTooltip'

export type AreaChartPlotType = SingleValueData
export type CandlestickChartPlotType = CandlestickData

export type ChartColorsSettings = {
  // area colors
  lineColor?: string
  areaTopColor?: string
  areaBottomColor?: string

  // candlestick colors
  chandleUpColor?: string
  chandleDownColor?: string

  // commom colors
  textColor?: string
  borderColor?: string
}

type ChartSettings = {
  height: number
  width?: number
  tickDateFormatter?: (date: number) => string
  tickPriceFormatter?: (value: number) => string
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  hideXAxis?: boolean
  hideYAxis?: boolean
}

type ChartBasePropsType = {
  colors?: ChartColorsSettings
  settings: ChartSettings
  tooltipName?: CHART_TOOLTIPS_TYPE
  tooltipAsset: string
}

export type AreaChartPropsType = ChartBasePropsType & {
  data: Array<AreaChartPlotType>
}

export type CandleStickPropsType = ChartBasePropsType & {
  data: Array<CandlestickChartPlotType>
}

export type ChartWrapperPropsType = ChartBasePropsType & {
  data:
    | {
        type: 'area'
        plots: Array<AreaChartPlotType>
      }
    | {
        type: 'candle'
        plots: Array<CandlestickChartPlotType>
      }
  numberOfItemsToDisplay?: number
  className?: string
  tooltipName?: CHART_TOOLTIPS_TYPE
  tooltipAsset: string
}

export type DoubleChartPropsType = {
  firstChart: {
    data: Array<AreaChartPlotType>
    colors: ChartColorsSettings
  }
  secondChart: {
    data: Array<AreaChartPlotType>
    colors: ChartColorsSettings
  }

  settings: ChartSettings
}
