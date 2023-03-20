import { ColorType, MouseEventParams } from 'lightweight-charts'

export const CHART_GRID_SETTING = {
  vertLines: {
    visible: false,
  },
  horzLines: {
    visible: false,
  },
}

export const CHART_LOCALE_SETTING = {
  locale: 'en-US',
}

export const DEFAULT_LAYOUT_SETTING = {
  background: { type: ColorType.Solid, color: 'transparent' },
  fontSize: 12,
}

export const getAxisSettings = (hideXAxis: boolean, hideYAxis: boolean) => {
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
