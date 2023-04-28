import { useRef, useEffect, useState } from 'react'
import { createChart, BusinessDay, UTCTimestamp, SingleValueData, CandlestickData } from 'lightweight-charts'

import { lightTextColor, headerColor } from 'styles'
import { parseDate } from 'utils/time'
import {
  DEFAULT_LAYOUT_SETTING,
  CHART_GRID_SETTING,
  getAxisSettings,
  CHART_LOCALE_SETTING,
  checkWhetherHideTooltip,
  DEFAULT_CROSSHAIR_SETTING,
  CHART_SERIES_OPTIONS,
  checkPlotType,
} from '../helpers/Chart.const'

import { ChartStyled } from '../Chart.style'
import DoubleChartTooltip, { DOUBLE_AMOUNT_DATE_TOOLTIP } from '../Tooltips/DoubleChartTooltip'

import {
  AREA_CHART_TYPE,
  CANDLESTICK_CHART_TYPE,
  DoubleChartPropsType,
  HISTOGRAM_CHART_TYPE,
} from '../helpers/Chart.types'

export const DoubleChart = ({
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
    crosshairOptions = DEFAULT_CROSSHAIR_SETTING,
    textColor = lightTextColor,
    borderColor = headerColor,
    firstChartSeriesMarkers,
    secondChartSeriesMarkers,
  } = {},
  firstChart: {
    data: { type: firstChartType, plots: firstChartPlots },
    colors: firstChartColors,
  },
  secondChart: {
    data: { type: secondChartType, plots: secondChartPlots },
    colors: secondChartColors,
  },
  tooltipName = DOUBLE_AMOUNT_DATE_TOOLTIP,
  tooltipAssetFirst,
  tooltipAssetSecond,
}: DoubleChartPropsType) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)

  const [tooltipData, setTooltipData] = useState<{
    xAxis: number
    firstChartYAxis: number | undefined
    secondChartYAxis: number | undefined
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
        textColor: textColor,
      },
      localization: CHART_LOCALE_SETTING,
      grid: CHART_GRID_SETTING,
      crosshair: crosshairOptions ?? {},
      ...getAxisSettings(Boolean(hideXAxis), Boolean(hideYAxis), yAxisSide),
    })

    // Setting the border color for the vertical axis and paddings for it, and show label only if it's full visible
    chart.priceScale(yAxisSide).applyOptions({
      borderColor: borderColor,
      entireTextOnly: true,
      scaleMargins: {
        top: 0.1,
        bottom: 0.03,
        ...(priceMargins ?? {}),
      },
    })

    // Setting the border color for the horizontal axis, and disabling overscroll to left | right, add formatter for xAxis
    chart.timeScale().applyOptions({
      borderColor,
      fixRightEdge: true,
      fixLeftEdge: true,
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time: BusinessDay | UTCTimestamp) => {
        if (tickDateFormatter) {
          return tickDateFormatter(Number(time))
        }
        return parseDate({ time: Number(time), timeFormat: 'HH:mm' })
      },
    })

    // Setting color of the first chart chart depends on it's type
    const seriesFirstChart =
      firstChartType === AREA_CHART_TYPE
        ? chart.addAreaSeries({
            lineColor: firstChartColors.lineColor,
            topColor: firstChartColors.areaTopColor,
            bottomColor: firstChartColors.areaBottomColor,
          })
        : firstChartType === CANDLESTICK_CHART_TYPE
        ? chart.addCandlestickSeries({
            upColor: firstChartColors.chandleUpColor,
            downColor: firstChartColors.chandleUpColor,
          })
        : firstChartType === HISTOGRAM_CHART_TYPE
        ? chart.addHistogramSeries({
            color: firstChartColors.barColor,
          })
        : null

    // Throw error if chart type is not specified
    if (!seriesFirstChart) throw new Error('No first chart data, or chart type is unknown')

    // Setting data for first chart
    seriesFirstChart.setData(firstChartPlots)
    seriesFirstChart.applyOptions(CHART_SERIES_OPTIONS)

    // set markers for series
    if (firstChartSeriesMarkers) {
      seriesFirstChart.setMarkers(firstChartSeriesMarkers)
    }

    // Setting color of the second chart chart depends on it's type
    const seriesSecondChart =
      secondChartType === AREA_CHART_TYPE
        ? chart.addAreaSeries({
            lineColor: secondChartColors.lineColor,
            topColor: secondChartColors.areaTopColor,
            bottomColor: secondChartColors.areaBottomColor,
          })
        : secondChartType === CANDLESTICK_CHART_TYPE
        ? chart.addCandlestickSeries({
            upColor: secondChartColors.chandleUpColor,
            downColor: secondChartColors.chandleUpColor,
          })
        : secondChartType === HISTOGRAM_CHART_TYPE
        ? chart.addHistogramSeries({
            color: secondChartColors.barColor,
          })
        : null

    // Throw error if chart type is not specified
    if (!seriesSecondChart) throw new Error('No second chart data, or chart type is unknown')

    // Setting data for second chart
    seriesSecondChart.setData(secondChartPlots)
    seriesSecondChart.applyOptions(CHART_SERIES_OPTIONS)

    // set markers for series
    if (secondChartSeriesMarkers) {
      seriesSecondChart.setMarkers(secondChartSeriesMarkers)
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
        const newTooltiData = {
          firstChartYAxis: 0,
          secondChartYAxis: 0,
          xAxis: 0,
        }

        const fistChartPlot = param.seriesData.get(seriesFirstChart) ?? {}
        if (checkPlotType<SingleValueData>(fistChartPlot, ['value'])) {
          newTooltiData.firstChartYAxis = fistChartPlot.value
          newTooltiData.xAxis = Number(fistChartPlot.time)
        }

        if (checkPlotType<CandlestickData>(fistChartPlot, ['close'])) {
          newTooltiData.firstChartYAxis = fistChartPlot.close
          newTooltiData.xAxis = Number(fistChartPlot.time)
        }

        const secondChartPlot = param.seriesData.get(seriesSecondChart) ?? {}

        if (checkPlotType<SingleValueData>(secondChartPlot, ['value'])) {
          newTooltiData.secondChartYAxis = secondChartPlot.value
          newTooltiData.xAxis = Number(secondChartPlot.time)
        }

        if (checkPlotType<CandlestickData>(secondChartPlot, ['close'])) {
          newTooltiData.secondChartYAxis = secondChartPlot.close
          newTooltiData.xAxis = Number(secondChartPlot.time)
        }

        setTooltipData(newTooltiData)

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
    crosshairOptions,
    dateTooltipFormatter,
    firstChartColors,
    firstChartPlots,
    firstChartType,
    height,
    hideXAxis,
    hideYAxis,
    priceMargins,
    secondChartColors,
    secondChartPlots,
    secondChartType,
    textColor,
    tickDateFormatter,
    width,
    yAxisSide,
  ])

  return (
    <ChartStyled ref={mainChartWrapperRef}>
      <DoubleChartTooltip
        xAxis={tooltipData?.xAxis ?? 0}
        yAxisFirst={tooltipData?.firstChartYAxis}
        yAxisSecond={tooltipData?.secondChartYAxis}
        assetFirst={tooltipAssetFirst}
        assetSecond={tooltipAssetSecond}
        tooltipName={tooltipName}
        dateTooltipFormatter={dateTooltipFormatter}
        valueTooltipFormatter={valueTooltipFormatter}
      />
      <div ref={chartContainerRef} />
    </ChartStyled>
  )
}
