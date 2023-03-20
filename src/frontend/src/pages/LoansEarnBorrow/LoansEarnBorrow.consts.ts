import { skyColor } from 'styles'
import { ChartPlotType } from 'app/App.components/Chart/Chart.view'

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

export const CHART_COLORS = {
  lineColor: skyColor,
  areaTopColor: skyColor,
  areaBottomColor: 'rgba(119, 164, 242, 0)',
  textColor: '#CDCDCD',
}

export type CardSettingsType = {
  priceName: string
  totalName: string
  buttonName: string
}

export type CardType = {
  title: string
  symbol: string
  apy: number
  price: number
  total: number
  id: number
  data: ChartPlotType[]
}