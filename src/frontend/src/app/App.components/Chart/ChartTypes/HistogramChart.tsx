import { useRef, useEffect, useState } from 'react'
import { createChart, BusinessDay, UTCTimestamp, SingleValueData } from 'lightweight-charts'

import styleColors from 'styles/colors'
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
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

import ChartTooltip, { AMOUNT_DATE_TOOLTIP } from '../Tooltips/ChartTooltip'
import { ChartStyled } from '../Chart.style'

import { AreaChartPropsType } from '../helpers/Chart.types'

export const HistogramChart = ({
  settings,
  colors,
  data,
  tooltipName = AMOUNT_DATE_TOOLTIP,
  tooltipAsset,
}: AreaChartPropsType) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const {
    height,
    width,
    tickDateFormatter,
    dateTooltipFormatter,
    valueTooltipFormatter,
    hideXAxis,
    hideYAxis,
    yAxisSide = 'left',
    priceMargins,
    crosshairOptions = DEFAULT_CROSSHAIR_SETTING,
    textColor = styleColors[themeSelected]['regularText'],
    borderColor = styleColors[themeSelected]['strokeColor'],
    seriesMarkers,
  } = settings ?? {}

  const { barColor = styleColors[themeSelected]['histogramChartColor'] } = colors ?? {}

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
        bottom: 0,
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

    // Setting color of the chart
    const series = chart.addHistogramSeries({
      color: barColor,
    })

    // Setting data
    series.setData(data)
    series.applyOptions(CHART_SERIES_OPTIONS)

    // set markers for series
    if (seriesMarkers) {
      series.setMarkers(seriesMarkers)
    }

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
        const plot = param.seriesData.get(series) ?? {}
        if (!checkPlotType<SingleValueData>(plot, ['value'])) return
        const { value, time } = plot

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

    window.addEventListener('resize', handleResize, { passive: true })
    chart.timeScale().fitContent()

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [
    borderColor,
    barColor,
    data,
    dateTooltipFormatter,
    height,
    hideXAxis,
    hideYAxis,
    textColor,
    tickDateFormatter,
    width,
    priceMargins,
    yAxisSide,
    crosshairOptions,
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
