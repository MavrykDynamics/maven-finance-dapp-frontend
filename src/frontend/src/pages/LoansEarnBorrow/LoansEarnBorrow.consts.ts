import { AreaChartPlotType } from 'app/App.components/Chart/helpers/Chart.types'
import { skyColor } from 'styles'

export const numberOfItemsToDisplay = 0

export const MINI_CHART_SETTINGS = {
  width: 300,
  height: 103,
  hideXAxis: true,
  hideYAxis: true,
  isPeriod: true,
}

export const CHART_SETTINGS = {
  width: 450,
  height: 270,
  hideXAxis: true,
  hideYAxis: true,
  isPeriod: true,
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
  address: string
  symbol: string
  annualRate: number
  annualRateName: 'APR' | 'APY'
  totalAmount: number
  price: number
  leftValue: number
  rightValue: number
  chartData: AreaChartPlotType[]
}
