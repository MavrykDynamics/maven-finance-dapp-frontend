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

export const AreaChart = ({
  settings: {
    height,
    width,
    tickDateFormatter,
    dateTooltipFormatter,
    valueTooltipFormatter,
    hideXAxis,
    hideYAxis,
    yAxisSide = 'right',
    priceMargins,
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
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)

  const [tooltipData, setTooltipData] = useState<{
    xAxis: number
    yAxis: number
  } | null>(null)

  useEffect(() => {
    if (!chartContainerRef?.current || !mainChartWrapperRef?.current) return

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef?.current?.clientWidth ?? 0,
        height: height ?? mainChartWrapperRef?.current?.clientHeight ?? 0,
      })
    }

    // Setting sizes of the chart, removing grid and layout default lines, setting xAxis formatter
    const chart = createChart(chartContainerRef.current, {
      width: width ?? chartContainerRef.current?.clientWidth ?? 0,
      height: height ?? mainChartWrapperRef.current?.clientHeight ?? 0,
      layout: {
        ...DEFAULT_LAYOUT_SETTING,
        textColor,
      },
      localization: CHART_LOCALE_SETTING,
      grid: CHART_GRID_SETTING,
      ...getAxisSettings(Boolean(hideXAxis), Boolean(hideYAxis), yAxisSide),
    })

    // Setting the border color for the vertical axis and paddings for it
    chart.priceScale(yAxisSide).applyOptions({
      borderColor,
      entireTextOnly: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
        ...(priceMargins ?? {}),
      },
    })

    // Setting the border color for the horizontal axis, and disabling overscroll to left | right
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

    // Setting color of the chart
    const series = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })

    // Setting data
    series.setData(data)

    // Setting yAxis data format
    series.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        minMove: 0.00000001,
        type: 'price',
      },
    })

    // Subscribe for tooltip update
    chart.subscribeCrosshairMove((param) => {
      if (checkWhetherHideTooltip(param, chartContainerRef)) {
        // hide tooltip
        if (mainChartWrapperRef.current) {
          mainChartWrapperRef.current.style.setProperty('--translateX', '0')
          mainChartWrapperRef.current.style.setProperty('--translateY', '0')
        }
      } else {
        // set tooltip values
        const { value, time } = (param.seriesData.get(series) ?? {}) as AreaChartPlotType

        setTooltipData({
          yAxis: Number(time),
          xAxis: parseFloat(String(value)),
        })

        if (mainChartWrapperRef.current && param.point) {
          mainChartWrapperRef.current.style.setProperty('--translateX', `${param.point.x + 15}`)
          mainChartWrapperRef.current.style.setProperty('--translateY', `${param.point.y - 20}`)
        }
      }
    })

    window.addEventListener('resize', handleResize)
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [
    areaBottomColor,
    areaTopColor,
    borderColor,
    data,
    dateTooltipFormatter,
    height,
    hideXAxis,
    hideYAxis,
    lineColor,
    priceMargins,
    textColor,
    tickDateFormatter,
    width,
    yAxisSide,
  ])

  return (
    <ChartStyled ref={mainChartWrapperRef}>
      <ChartTooltip
        xAxis={tooltipData?.xAxis}
        yAxis={tooltipData?.yAxis}
        asset={tooltipAsset}
        tooltipName={tooltipName}
        dateTooltipFormatter={dateTooltipFormatter}
        valueTooltipFormatter={valueTooltipFormatter}
      />
      <div ref={chartContainerRef} />
    </ChartStyled>
  )
}
