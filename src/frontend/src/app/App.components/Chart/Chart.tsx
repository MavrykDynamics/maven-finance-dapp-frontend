// styles
import { Plug } from './Chart.style'

// components
import Icon from '../Icon/Icon.view'
import { AreaChart } from './AreaChart'
import { CandlestickChart } from './CandlestickChart'

import { ChartWrapperPropsType } from './Chart.types'

export const Chart = ({
  data,
  colors,
  settings,
  numberOfItemsToDisplay = 15,
  className,
  tooltipName,
  tooltipAsset,
}: ChartWrapperPropsType) => {
  if (data.plots.length < numberOfItemsToDisplay) {
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

  if (data.type === 'area')
    return (
      <AreaChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  if (data.type === 'candle')
    return (
      <CandlestickChart
        colors={colors}
        settings={settings}
        data={data.plots}
        tooltipName={tooltipName}
        tooltipAsset={tooltipAsset}
      />
    )

  return null
}

// export const TradingViewChart = ({
//   data,
//   colors: {
//     lineColor = skyColor,
//     areaTopColor = skyColor,
//     areaBottomColor = 'transparent',
//     textColor = lightTextColor,
//     borderColor = headerColor,
//   } = {},
//   settings: {
//     height,
//     width,
//     dateTooltipFormatter,
//     valueTooltipFormatter,
//     tickPriceFormatter,
//     tickDateFormatter,
//     hideXAxis,
//     hideYAxis,
//     tooltipAsset = 'USD',
//   },
//   className,
//   children,
// }: TradingViewChartProps) => {
//   const chartContainerRef = useRef<HTMLDivElement | null>(null)
//   const mainChartWrapperRef = useRef<HTMLDivElement | null>(null)
//   const [tooltipValue, setTooltipValue] = useState<Omit<TooltipPropsType, 'tooltipAsset'>>({
//     amount: data.at(-1)?.value,
//     date: data.at(-1)?.time,
//   })

//   useEffect(() => {
//     const handleResize = () => {
//       chart.applyOptions({ width: chartContainerRef?.current?.clientWidth ?? 0 })
//     }

//     const chart = createChart(chartContainerRef?.current ?? '', {
//       layout: {
//         background: { type: ColorType.Solid, color: 'transparent' },
//         textColor,
//         fontSize: 12,
//       },
//       grid: {
//         vertLines: {
//           visible: false,
//         },
//         horzLines: {
//           visible: false,
//         },
//       },
//       width: width ?? chartContainerRef?.current?.clientWidth ?? 0,
//       height,
//       localization: {
//         locale: 'en-US',
//         timeFormatter: (time: BusinessDay | UTCTimestamp) => {
//           return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
//         },
//       },
//       ...(hideXAxis
//         ? {
//             timeScale: {
//               visible: false,
//             },
//           }
//         : {}),
//       ...(hideYAxis
//         ? {
//             rightPriceScale: {
//               visible: false,
//             },
//             leftPriceScale: {
//               visible: false,
//             },
//           }
//         : {}),
//     })

//     // Setting the border color for the vertical axis
//     chart.priceScale().applyOptions({
//       borderColor,
//       scaleMargins: {
//         top: 0.1,
//         bottom: 0.1,
//       },
//     })

//     // Setting the border color for the horizontal axis
//     chart.timeScale().applyOptions({
//       borderColor,
//       tickMarkFormatter: (time: UTCTimestamp | BusinessDay) => {
//         return tickDateFormatter?.(Number(time)) ?? parseDate({ time: Number(time), timeFormat: 'HH:mm' }) ?? ''
//       },
//       fixRightEdge: true,
//       fixLeftEdge: true,
//     })

//     const series = chart.addAreaSeries({
//       lineColor,
//       topColor: areaTopColor,
//       bottomColor: areaBottomColor,
//     })
//     series.setData(data)
//     series.applyOptions({
//       lastValueVisible: false,
//       priceLineVisible: false,
//       priceFormat: {
//         type: 'custom',
//         minMove: 0.000001,
//         formatter: (price: any) =>
//           formatNumber({
//             showDecimal: true,
//             decimalsToShow: 6,
//             number: parseFloat(price),
//           }),
//       },
//     })

//     chart.subscribeCrosshairMove((param) => {
//       if (
//         !chartContainerRef?.current ||
//         param.point === undefined ||
//         !param.time ||
//         param.point.x < 0 ||
//         param.point.x > chartContainerRef?.current?.clientWidth ||
//         param.point.y < 0 ||
//         param.point.y > chartContainerRef?.current?.clientHeight
//       ) {
//         // hide tooltip
//         if (mainChartWrapperRef.current) {
//           mainChartWrapperRef.current.style.setProperty('--translateX', '0')
//           mainChartWrapperRef.current.style.setProperty('--translateY', '0')
//         }
//       } else {
//         // set tooltip values
//         setTooltipValue({
//           ...tooltipValue,
//           date:
//             dateTooltipFormatter?.(Number(param.time)) ??
//             parseDate({ time: Number(param.time), timeFormat: 'MMM DD, HH:mm Z' }) ??
//             '',
//           amount: parseFloat(String(param.seriesPrices.get(series))),
//         })
//         if (mainChartWrapperRef.current) {
//           mainChartWrapperRef.current.style.setProperty('--translateX', `${param.point.x + 15}`)
//           mainChartWrapperRef.current.style.setProperty('--translateY', `${param.point.y - 20}`)
//         }
//       }
//     })

//     window.addEventListener('resize', handleResize)
//     chart.timeScale().fitContent()

//     return () => {
//       window.removeEventListener('resize', handleResize)
//       chart.remove()
//     }
//   }, [
//     areaBottomColor,
//     areaTopColor,
//     borderColor,
//     data,
//     dateTooltipFormatter,
//     height,
//     hideXAxis,
//     hideYAxis,
//     lineColor,
//     textColor,
//     tickDateFormatter,
//     width,
//   ])

//   return (
//     <ChartStyled className={className} ref={mainChartWrapperRef}>
//       <div ref={chartContainerRef} />
//       <TradingViewTooltip amount={tooltipValue?.amount} date={tooltipValue?.date} tooltipAsset={tooltipAsset} />
//       {children}
//     </ChartStyled>
//   )
// }
