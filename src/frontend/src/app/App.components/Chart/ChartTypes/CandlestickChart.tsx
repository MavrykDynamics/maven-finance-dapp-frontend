import { useRef, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { createChart, BusinessDay, UTCTimestamp, CandlestickData } from 'lightweight-charts'

import { upColor, downColor, lightTextColor, headerColor } from 'styles'
import { parseDate } from 'utils/time'
import {
  DEFAULT_LAYOUT_SETTING,
  CHART_GRID_SETTING,
  getAxisSettings,
  CHART_LOCALE_SETTING,
  checkWhetherHideTooltip,
  CHART_SERIES_OPTIONS,
  DEFAULT_CROSSHAIR_SETTING,
  checkPlotType,
} from '../helpers/Chart.const'

import ChartTooltip, { AMOUNT_DATE_TOOLTIP } from '../Tooltips/ChartTooltip'
import { ChartStyled } from '../Chart.style'

import { CandleStickPropsType } from '../helpers/Chart.types'

export const CandlestickChart = ({
  settings: {
    height,
    width,
    tickDateFormatter,
    dateTooltipFormatter,
    valueTooltipFormatter,
    hideXAxis,
    hideYAxis,
    priceMargins,
    yAxisSide = 'left',
    crosshairOptions = DEFAULT_CROSSHAIR_SETTING,
    textColor = lightTextColor,
    borderColor = headerColor,
    seriesMarkers,
    isPeriod = false,
  } = {},
  colors: { chandleUpColor = upColor, chandleDownColor = downColor } = {},
  data,
  tooltipName = AMOUNT_DATE_TOOLTIP,
  tooltipAsset,
}: CandleStickPropsType) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)

  const [tooltipData, setTooltipData] = useState<{
    xAxis: number
    yAxis: number
    isLastPlot: boolean
  } | null>(null)

  useEffect(() => {
    if (!chartContainerRef?.current || !mainChartWrapperRef?.current) return

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef?.current?.clientWidth ?? 0,
        height: height ?? mainChartWrapperRef?.current?.clientHeight ?? 0,
      })
    }

    // Setting sizes of the chart, removing grid and layout default lines, disabling crosshair, hiding axises
    const chart = createChart(chartContainerRef.current, {
      width: width ?? chartContainerRef.current?.clientWidth ?? 0,
      height: height ?? mainChartWrapperRef.current?.clientHeight ?? 0,
      layout: {
        ...DEFAULT_LAYOUT_SETTING,
        textColor,
      },
      localization: CHART_LOCALE_SETTING,
      grid: CHART_GRID_SETTING,
      crosshair: crosshairOptions ?? {},
      ...getAxisSettings(Boolean(hideXAxis), Boolean(hideYAxis), yAxisSide),
    })

    // Setting the border color for the vertical axis and paddings for it, and show label only if it's full visible
    chart.priceScale(yAxisSide).applyOptions({
      borderColor,
      entireTextOnly: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
        ...(priceMargins ?? {}),
      },
    })

    // Setting the border color for the horizontal axis, and disabling overscroll to left | right, add formatter for xAxis
    chart.timeScale().applyOptions({
      borderColor,
      fixRightEdge: true,
      fixLeftEdge: true,
      tickMarkFormatter: (time: BusinessDay | UTCTimestamp) => {
        if (tickDateFormatter) {
          return tickDateFormatter(Number(time))
        }
        return parseDate({ time: Number(time), timeFormat: 'HH:mm' })
      },
    })

    // Setting color of the candles
    const series = chart.addCandlestickSeries({
      upColor: chandleUpColor,
      downColor: chandleDownColor,
    })

    // Setting data
    series.setData(data)
    series.applyOptions(CHART_SERIES_OPTIONS)

    // set markers for series
    if (seriesMarkers) {
      series.setMarkers(seriesMarkers)
    }

    chart.subscribeCrosshairMove((param) => {
      if (checkWhetherHideTooltip(param, chartContainerRef)) {
        // hide tooltip
        if (mainChartWrapperRef.current) {
          mainChartWrapperRef.current.style.setProperty('--translateX', '0')
          mainChartWrapperRef.current.style.setProperty('--translateY', '0')
        }
      } else {
        // set tooltip values
        const plot = param.seriesData.get(series) ?? {}
        if (!checkPlotType<CandlestickData>(plot, ['close'])) return
        const { close, time } = plot

        if (isPeriod) {
          const dayStart = dayjs().hour(0).minute(0).second(0).millisecond(0).valueOf()
          const dayEnd = dayjs().hour(23).minute(59).second(59).millisecond(999).valueOf()

          setTooltipData({
            yAxis: Number(time),
            xAxis: parseFloat(String(close)),
            isLastPlot: Number(time) <= dayEnd && Number(time) >= dayStart,
          })
        } else {
          setTooltipData({
            yAxis: Number(time),
            xAxis: parseFloat(String(close)),
            isLastPlot: false,
          })
        }

        if (mainChartWrapperRef.current && param.point) {
          mainChartWrapperRef.current.style.setProperty('--translateX', `${param.point.x + 15}`)
          mainChartWrapperRef.current.style.setProperty('--translateY', `${param.point.y - 20}`)
        }
      }
    })

    window.addEventListener('resize', handleResize, { passive: true })
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [
    borderColor,
    chandleDownColor,
    chandleUpColor,
    crosshairOptions,
    data,
    dateTooltipFormatter,
    height,
    hideXAxis,
    hideYAxis,
    priceMargins,
    textColor,
    tickDateFormatter,
    width,
    yAxisSide,
    isPeriod,
    seriesMarkers,
  ])

  return (
    <ChartStyled ref={mainChartWrapperRef}>
      <ChartTooltip
        xAxis={tooltipData?.xAxis}
        yAxis={tooltipData?.yAxis}
        isLastPlot={tooltipData?.isLastPlot}
        isPeriod={isPeriod}
        asset={tooltipAsset}
        tooltipName={tooltipName}
        dateTooltipFormatter={dateTooltipFormatter}
        valueTooltipFormatter={valueTooltipFormatter}
      />
      <div ref={chartContainerRef} />
    </ChartStyled>
  )
}
