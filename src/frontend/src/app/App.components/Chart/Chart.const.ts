import { ColorType } from 'lightweight-charts'

export const CHART_GRID_SETTING = {
  vertLines: {
    visible: false,
  },
  horzLines: {
    visible: false,
  },
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
