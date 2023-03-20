import { useRef, useEffect, useState } from 'react'
import { createChart, BusinessDay, UTCTimestamp } from 'lightweight-charts'

import { skyColor, lightTextColor, headerColor } from 'styles'
import { parseDate } from 'utils/time'
import { formatNumber } from '../CommaNumber/CommaNumber.controller'
import { DEFAULT_LAYOUT_SETTING, CHART_GRID_SETTING, getAxisSettings } from './Chart.const'

import { ChartStyled } from './Chart.style'

import { AreaChartPropsType } from './Chart.types'
import ChartTooltip, { PRICE_DATA_TOOLTIP } from './Tooltips/ChartTooltip'

export const AreaChart = ({
  settings: {
    height,
    width,
    tickDateFormatter,
    tickPriceFormatter,
    dateTooltipFormatter,
    valueTooltipFormatter,
    hideXAxis,
    hideYAxis,
  },
  colors: {
    lineColor = skyColor,
    areaTopColor = skyColor,
    areaBottomColor = 'transparent',
    textColor = lightTextColor,
    borderColor = headerColor,
  } = {},
  data,
  tooltipName = PRICE_DATA_TOOLTIP,
  tooltipAsset,
}: AreaChartPropsType) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)

  const [tooltipData, setTooltipData] = useState<{
    xAxis: number
    yAxis: number
  } | null>(null)

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef?.current?.clientWidth ?? 0 })
    }

    const chart = createChart(chartContainerRef?.current ?? '', {
      width: width ?? chartContainerRef?.current?.clientWidth ?? 0,
      height,
      layout: {
        ...DEFAULT_LAYOUT_SETTING,
        textColor,
      },
      localization: {
        locale: 'en-US',
        timeFormatter: (time: BusinessDay | UTCTimestamp) =>
          tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }),
      },
      grid: CHART_GRID_SETTING,
      ...getAxisSettings(Boolean(hideXAxis), Boolean(hideYAxis)),
    })

    // Setting the border color for the vertical axis
    chart.priceScale().applyOptions({
      borderColor,
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    })

    // Setting the border color for the horizontal axis
    chart.timeScale().applyOptions({
      borderColor,
      tickMarkFormatter: (time: UTCTimestamp | BusinessDay) =>
        tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }),
      fixRightEdge: true,
      fixLeftEdge: true,
    })

    const series = chart.addAreaSeries({
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })

    series.setData(data)
    series.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: 'custom',
        minMove: 0.000001,
        formatter: (price: any) =>
          tickPriceFormatter?.(parseFloat(price)) ??
          formatNumber({
            showDecimal: true,
            decimalsToShow: 6,
            number: parseFloat(price),
          }),
      },
    })

    chart.subscribeCrosshairMove((param) => {
      if (
        !chartContainerRef?.current ||
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef?.current?.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef?.current?.clientHeight
      ) {
        // hide tooltip
        if (mainChartWrapperRef.current) {
          mainChartWrapperRef.current.style.setProperty('--translateX', '0')
          mainChartWrapperRef.current.style.setProperty('--translateY', '0')
        }
      } else {
        // set tooltip values
        setTooltipData({
          yAxis: Number(param.time),
          xAxis: parseFloat(String(param.seriesPrices.get(series))),
        })

        if (mainChartWrapperRef.current) {
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
    textColor,
    tickDateFormatter,
    tickPriceFormatter,
    width,
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
