import { formatNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { ColorType, MouseEventParams } from 'lightweight-charts'

// Chart types
export const AREA_CHART_TYPE = 'area'
export const CANDLESTICK_CHART_TYPE = 'candle'
export const HISTOGRAM_CHART_TYPE = 'histogram'

/**
 *
 * @param price can be any from lightweight typings
 *
 * @returns formatted number in string type
 *
 * @todo add decimals showing based on current visible range currently no api for it (https://github.com/tradingview/lightweight-charts/issues/621)
 */
export const yAxisValuesFormatter = (price: any) => {
  if (Number(price) > 2 || Number(price) <= -2)
    return formatNumber({
      number: Number(price),
      decimalsToShow: 0,
    })

  return formatNumber({
    number: Number(price),
    decimalsToShow: 2,
  })
}

export const CHART_GRID_SETTING = {
  vertLines: {
    visible: false,
  },
  horzLines: {
    visible: false,
  },
}

export const DEFAULT_CROSSHAIR_SETTING = {
  vertLine: {
    labelVisible: false,
  },
}

export const CHART_SERIES_OPTIONS = {
  lastValueVisible: false,
  priceLineVisible: false,
  priceFormat: {
    // Commented cuz can't adjust yAis line format, ensure we don't need this
    // minMove: 0.000000001,
    type: 'custom' as 'custom',
    formatter: yAxisValuesFormatter,
  },
}

export const CHART_LOCALE_SETTING = {
  locale: 'en-US',
}

export const DEFAULT_LAYOUT_SETTING = {
  background: { type: ColorType.Solid, color: 'transparent' },
  fontSize: 12,
}

export const getAxisSettings = (hideXAxis: boolean, hideYAxis: boolean, yAxisSide: 'left' | 'right') => {
  return {
    ...(hideXAxis
      ? {
          timeScale: {
            visible: false,
          },
        }
      : {}),
    ...(hideYAxis
      ? {
          rightPriceScale: {
            visible: false,
          },
          leftPriceScale: {
            visible: false,
          },
        }
      : {}),
    ...(!hideYAxis && yAxisSide === 'left'
      ? {
          leftPriceScale: {
            visible: true,
          },
          rightPriceScale: {
            visible: false,
          },
        }
      : {}),

    ...(!hideYAxis && yAxisSide === 'right'
      ? {
          rightPriceScale: {
            visible: true,
          },
          leftPriceScale: {
            visible: false,
          },
        }
      : {}),
  }
}

export const checkWhetherHideTooltip = (param: MouseEventParams, chartRef: React.RefObject<HTMLDivElement | null>) => {
  return (
    !chartRef?.current ||
    param.point === undefined ||
    !param.time ||
    param.point.x < 0 ||
    param.point.x > chartRef?.current?.clientWidth ||
    param.point.y < 0 ||
    param.point.y > chartRef?.current?.clientHeight
  )
}

export const checkPlotType = function <T>(plot: any, fieldsToCheck: Array<string>): plot is T {
  return fieldsToCheck.every((field) => field in plot)
}
