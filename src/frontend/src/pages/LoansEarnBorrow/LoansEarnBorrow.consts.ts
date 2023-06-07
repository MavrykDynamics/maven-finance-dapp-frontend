import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { skyColor } from 'styles'

export const numberOfItemsToDisplay = 3

export const MINI_CHART_SETTINGS = {
  width: 305,
  height: 103,
  hideXAxis: true,
  hideYAxis: true,
}

export const CHART_SETTINGS = {
  width: 372,
  height: 182,
  hideXAxis: true,
  hideYAxis: true,
}

// TODO: use colors[theme]
export const CHART_COLORS = {
  lineColor: skyColor,
  areaTopColor: skyColor,
  areaBottomColor: 'rgba(119, 164, 242, 0)',
  textColor: '#CDCDCD',
}

export type MarketSettingsType = {
  priceName: string
  totalName: string
  leftValueName: string
  rightValueName: string
  buttonName: string
  isButtonSymbol?: boolean
  marketTabName: string
}

export type MarketType = {
  icon: string
  symbol: string
  annualRate: number
  annualRateName: 'APR' | 'APY'
  totalAmount: number
  price: number
  leftValue: number
  rightValue: number
  chartData: AreaChartPlotType[]
}
