import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, BusinessDay, UTCTimestamp } from 'lightweight-charts'

// styles
import { ChartStyled, Plug, TradingViewTooltipStyled } from './Chart.style'

// helpers
import { parseDate } from '../../../utils/time'

// components
import Icon from '../Icon/Icon.view'

import { CommaNumber, formatNumber } from '../CommaNumber/CommaNumber.controller'
import { headerColor, lightTextColor, skyColor } from 'styles'

export type ChartPlotType = { time: UTCTimestamp; value: number }
type TradingViewChartProps = {
  data: ChartPlotType[]
  colors?: {
    lineColor?: string
    areaTopColor?: string
    areaBottomColor?: string
    textColor?: string
    borderColor?: string
  }
  settings: {
    height: number
    width?: number
    tickDateFormatter?: (date: number) => string
    tickPriceFormatter?: (value: number) => string
    dateTooltipFormatter?: (date: number) => string
    valueTooltipFormatter?: (date: number) => string
    hideXAxis?: boolean
    hideYAxis?: boolean
    tooltipAsset?: string
  }
  className?: string
  children?: React.ReactNode
}

type TooltipPropsType = {
  amount?: number
  date?: string | number
  tooltipAsset: string
}

const TradingViewTooltip = ({ amount, date, tooltipAsset }: TooltipPropsType) => {
  if (amount === undefined || date === undefined) {
    return null
  }

  return (
    <TradingViewTooltipStyled>
      <div className="value">
        <CommaNumber endingText={tooltipAsset} value={amount} />
      </div>
      <div className="date">{date}</div>
    </TradingViewTooltipStyled>
  )
}

export const Chart = ({
  data,
  colors,
  settings,
  numberOfItemsToDisplay = 15,
  className,
  children = null,
}: TradingViewChartProps & { numberOfItemsToDisplay?: number; children?: React.ReactNode }) => {
  if (data.length < numberOfItemsToDisplay) {
    return (
      <Plug className={className}>
        <div>
          <Icon id="stars" className="icon-stars" />
          <Icon id="cow" className="icon-cow" />
        </div>

        <p>There is not enough data to display the chart</p>
      </Plug>
    )
  }

  return (
    <TradingViewChart data={data} settings={settings} colors={colors} className={className}>
      {children}
    </TradingViewChart>
  )
}

export const TradingViewChart = ({
  data,
  colors: {
    lineColor = skyColor,
    areaTopColor = skyColor,
    areaBottomColor = 'transparent',
    textColor = lightTextColor,
    borderColor = headerColor,
  } = {},
  settings: {
    height,
    width,
    dateTooltipFormatter,
    valueTooltipFormatter,
    tickPriceFormatter,
    tickDateFormatter,
    hideXAxis,
    hideYAxis,
    tooltipAsset = 'USD',
  },
  className,
  children,
}: TradingViewChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)
  const [tooltipValue, setTooltipValue] = useState<Omit<TooltipPropsType, 'tooltipAsset'>>({
    amount: data.at(-1)?.value,
    date: data.at(-1)?.time,
  })

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef?.current?.clientWidth ?? 0 })
    }

    const chart = createChart(chartContainerRef?.current ?? '', {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 12,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      width: width ?? chartContainerRef?.current?.clientWidth ?? 0,
      height,
      localization: {
        locale: 'en-US',
        timeFormatter: (time: BusinessDay | UTCTimestamp) => {
          return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
        },
      },
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
    })

    // Setting the border color for the vertical axis
    chart.priceScale().applyOptions({
      borderColor,
      scaleMargins: {
        top: 0.1,
        bottom: 0.03,
      },
    })

    // Setting the border color for the horizontal axis
    chart.timeScale().applyOptions({
      borderColor,
      tickMarkFormatter: (time: UTCTimestamp | BusinessDay) => {
        return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
      },
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
        minMove: 1,
        formatter: (price: any) =>
          formatNumber({
            showDecimal: true,
            decimalsToShow: 2,
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
        setTooltipValue({
          ...tooltipValue,
          date:
            dateTooltipFormatter?.(Number(param.time)) ??
            parseDate({ time: Number(param.time), timeFormat: 'MMM DD, HH:mm Z' }) ??
            '',
          amount: Number(param.seriesPrices.get(series)),
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
    width,
  ])

  return (
    <ChartStyled className={className} ref={mainChartWrapperRef}>
      <div ref={chartContainerRef} />
      <TradingViewTooltip amount={tooltipValue?.amount} date={tooltipValue?.date} tooltipAsset={tooltipAsset} />
      {children}
    </ChartStyled>
  )
}
