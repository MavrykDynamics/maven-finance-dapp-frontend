import { useRef, useEffect } from 'react'
import { createChart, BusinessDay, UTCTimestamp } from 'lightweight-charts'

import { lightTextColor, headerColor, upColor, downColor } from 'styles'
import { parseDate } from 'utils/time'
import { formatNumber } from '../CommaNumber/CommaNumber.controller'
import { DEFAULT_LAYOUT_SETTING, CHART_GRID_SETTING, getAxisSettings } from './Chart.const'

import { CandleStickPropsType } from './Chart.types'

import { ChartStyled, TradingViewTooltipStyled } from './Chart.style'

export const CandlestickChart = ({
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
    textColor = lightTextColor,
    borderColor = headerColor,
    chandleUpColor = upColor,
    chandleDownColor = downColor,
  } = {},
  data,
}: CandleStickPropsType) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)

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

    const series = chart.addCandlestickSeries({
      upColor: chandleUpColor,
      downColor: chandleDownColor,
    })

    series.setData(data)
    series.applyOptions({
      lastValueVisible: false,
      priceLineVisible: false,
      priceFormat: {
        type: 'custom',
        minMove: 0.000001,
        formatter: (price: any) =>
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
        // setTooltipValue({
        //   ...tooltipValue,
        //   date:
        //     dateTooltipFormatter?.(Number(param.time)) ??
        //     parseDate({ time: Number(param.time), timeFormat: 'MMM DD, HH:mm Z' }) ??
        //     '',
        //   amount: parseFloat(String(param.seriesPrices.get(series))),
        // })

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
    borderColor,
    chandleDownColor,
    chandleUpColor,
    data,
    dateTooltipFormatter,
    height,
    hideXAxis,
    hideYAxis,
    textColor,
    tickDateFormatter,
    width,
  ])

  return (
    <ChartStyled ref={mainChartWrapperRef}>
      <TradingViewTooltipStyled>
        tooltip
        {/* <div className="value">
        <CommaNumber endingText={tooltipAsset} value={amount} showDecimal decimalsToShow={6} />
      </div>
      <div className="date">{date}</div> */}
      </TradingViewTooltipStyled>
      <div ref={chartContainerRef} />
    </ChartStyled>
  )
}
