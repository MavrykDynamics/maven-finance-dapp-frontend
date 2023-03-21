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
  buttonSymbol?: boolean
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

// TODO: testing data
export const cards = [
  {
    title: 'tezos',
    symbol: 'xtz',
    apy: 0.255332,
    price: 0.3223,
    total: 234_233_21,
    id: 1,
    data: [
      {
        time: 1678558660000,
        value: 122,
      },
      {
        time: 1678558765000,
        value: 132.81,
      },
      {
        time: 1678558780000,
        value: 143.62,
      },
      {
        time: 1678616610000,
        value: 170.645,
      },
      {
        time: 1678703630000,
        value: 176.05,
      },
      {
        time: 1678704305000,
        value: 284.15,
      },
      {
        time: 1678710430000,
        value: 305.77,
      },
      {
        time: 1678873925000,
        value: 311.17499999999995,
      },
      {
        time: 1679302820000,
        value: 314.41799999999995,
      },
      {
        time: 1689302820000,
        value: 315.41799999999995,
      },
      {
        time: 1699302820000,
        value: 317.41799999999995,
      },
      {
        time: 16793028200001,
        value: 318.41799999999995,
      },
      {
        time: 16793028200002,
        value: 319.41799999999995,
      },
      {
        time: 16793028200003,
        value: 320.41799999999995,
      },
      {
        time: 16793028200004,
        value: 321.41799999999995,
      },
      {
        time: 16793028200005,
        value: 322.41799999999995,
      },
      {
        time: 16793028200006,
        value: 323.41799999999995,
      },
    ],
  },
  {
    title: 'thezer',
    symbol: 'usdt',
    apy: 0.81332,
    price: 0.3223,
    total: 234_233_21,
    id: 1,
    data: [
      {
        time: 1678558660000,
        value: 122,
      },
      {
        time: 1678558765000,
        value: 132.81,
      },
      {
        time: 1678558780000,
        value: 143.62,
      },
      {
        time: 1678616610000,
        value: 170.645,
      },
      {
        time: 1678703630000,
        value: 176.05,
      },
      {
        time: 1678704305000,
        value: 284.15,
      },
      {
        time: 1678710430000,
        value: 305.77,
      },
      {
        time: 1678873925000,
        value: 311.17499999999995,
      },
      {
        time: 1679302820000,
        value: 314.41799999999995,
      },
      {
        time: 1689302820000,
        value: 315.41799999999995,
      },
      {
        time: 1699302820000,
        value: 317.41799999999995,
      },
      {
        time: 16793028200001,
        value: 318.41799999999995,
      },
      {
        time: 16793028200002,
        value: 319.41799999999995,
      },
      {
        time: 16793028200003,
        value: 320.41799999999995,
      },
      {
        time: 16793028200004,
        value: 321.41799999999995,
      },
      {
        time: 16793028200005,
        value: 322.41799999999995,
      },
      {
        time: 16793028200006,
        value: 323.41799999999995,
      },
    ],
  },
  {
    title: 'lugh',
    symbol: 'eurl',
    apy: 0.87332,
    price: 0.3123,
    total: 234_233_21,
    id: 1,
    data: [
      {
        time: 1678558660000,
        value: 122,
      },
      {
        time: 1678558765000,
        value: 132.81,
      },
      {
        time: 1678558780000,
        value: 143.62,
      },
      {
        time: 1678616610000,
        value: 170.645,
      },
      {
        time: 1678703630000,
        value: 176.05,
      },
      {
        time: 1678704305000,
        value: 284.15,
      },
      {
        time: 1678710430000,
        value: 305.77,
      },
      {
        time: 1678873925000,
        value: 311.17499999999995,
      },
      {
        time: 1679302820000,
        value: 314.41799999999995,
      },
      {
        time: 1689302820000,
        value: 315.41799999999995,
      },
      {
        time: 1699302820000,
        value: 317.41799999999995,
      },
      {
        time: 16793028200001,
        value: 318.41799999999995,
      },
      {
        time: 16793028200002,
        value: 319.41799999999995,
      },
      {
        time: 16793028200003,
        value: 320.41799999999995,
      },
      {
        time: 16793028200004,
        value: 321.41799999999995,
      },
      {
        time: 16793028200005,
        value: 322.41799999999995,
      },
      {
        time: 16793028200006,
        value: 323.41799999999995,
      },
    ],
  },
  {
    title: 'sirius',
    symbol: 'sirs',
    apy: 0.64132,
    price: 0.1223,
    total: 234_233_21,
    id: 1,
    data: [
      {
        time: 1678558660000,
        value: 122,
      },
      {
        time: 1678558765000,
        value: 132.81,
      },
      {
        time: 1678558780000,
        value: 143.62,
      },
      {
        time: 1678616610000,
        value: 170.645,
      },
      {
        time: 1678703630000,
        value: 176.05,
      },
      {
        time: 1678704305000,
        value: 284.15,
      },
      {
        time: 1678710430000,
        value: 305.77,
      },
      {
        time: 1678873925000,
        value: 311.17499999999995,
      },
      {
        time: 1679302820000,
        value: 314.41799999999995,
      },
      {
        time: 1689302820000,
        value: 315.41799999999995,
      },
      {
        time: 1699302820000,
        value: 317.41799999999995,
      },
      {
        time: 16793028200001,
        value: 318.41799999999995,
      },
      {
        time: 16793028200002,
        value: 319.41799999999995,
      },
      {
        time: 16793028200003,
        value: 320.41799999999995,
      },
      {
        time: 16793028200004,
        value: 321.41799999999995,
      },
      {
        time: 16793028200005,
        value: 322.41799999999995,
      },
      {
        time: 16793028200006,
        value: 323.41799999999995,
      },
    ],
  },
] as CardType[]
