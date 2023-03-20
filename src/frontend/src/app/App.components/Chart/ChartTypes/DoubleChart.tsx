import { useRef, useEffect, useState } from 'react'
import { createChart, BusinessDay, UTCTimestamp } from 'lightweight-charts'

import { skyColor, lightTextColor, headerColor } from 'styles'
import { parseDate } from 'utils/time'
import {
  DEFAULT_LAYOUT_SETTING,
  CHART_GRID_SETTING,
  getAxisSettings,
  CHART_LOCALE_SETTING,
  checkWhetherHideTooltip,
} from '../helpers/Chart.const'

import ChartTooltip, { AMOUNT_DATA_TOOLTIP } from '../Tooltips/ChartTooltip'
import { ChartStyled } from '../Chart.style'

import { AreaChartPlotType, AreaChartPropsType } from '../helpers/Chart.types'

export const DoubleVsChart = ({
  settings: {
    height,
    width,
    tickDateFormatter,
    dateTooltipFormatter,
    valueTooltipFormatter,
    hideXAxis,
    hideYAxis,
  } = {},
  colors: {
    lineColor = skyColor,
    areaTopColor = skyColor,
    areaBottomColor = 'transparent',
    textColor = lightTextColor,
    borderColor = headerColor,
  } = {},
  data,
  tooltipName = AMOUNT_DATA_TOOLTIP,
  tooltipAsset,
}: AreaChartPropsType) => {
  return null
}
