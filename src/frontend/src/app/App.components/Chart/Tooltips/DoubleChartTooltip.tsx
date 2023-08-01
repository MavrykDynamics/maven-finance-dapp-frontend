import { parseDate } from 'utils/time'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DoubleAmountDateTooltipStyled } from '../Chart.style'

export const DOUBLE_AMOUNT_DATE_TOOLTIP = 'DoubleAmountDateTooltip'
export type DoubleChartTooltipsTypes = typeof DOUBLE_AMOUNT_DATE_TOOLTIP

type DoubleChartTootipProps = {
  xAxis: number
  yAxisFirst?: number
  yAxisSecond?: number
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  assetFirst: string
  assetSecond: string
  isPeriod: boolean
  isLastPlot: boolean
}

const DoubleAmountDateTooltip = ({
  xAxis,
  yAxisFirst,
  yAxisSecond,
  assetFirst,
  assetSecond,
  isLastPlot,
  isPeriod,
  dateTooltipFormatter,
  valueTooltipFormatter,
}: DoubleChartTootipProps) => {
  return (
    <DoubleAmountDateTooltipStyled>
      <div className="values">
        {yAxisFirst ? (
          <div className="value">
            <CommaNumber
              endingText={assetFirst}
              value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(yAxisFirst)) : yAxisFirst}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        ) : null}
        {yAxisSecond ? (
          <div className="value">
            <CommaNumber
              endingText={assetSecond}
              value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(yAxisSecond)) : yAxisSecond}
              showDecimal
              decimalsToShow={2}
            />
          </div>
        ) : null}
      </div>
      <div className="date">
        {dateTooltipFormatter?.(xAxis) ??
          parseDate({ time: xAxis, timeFormat: isPeriod && !isLastPlot ? 'MMM DD' : 'MMM DD, HH:mm Z' })}
      </div>
    </DoubleAmountDateTooltipStyled>
  )
}

type DoubleChartTootipWrapperProps = Omit<DoubleChartTootipProps, 'isLastPlot'> & {
  xAxis?: number
  isLastPlot?: boolean
  tooltipName: DoubleChartTooltipsTypes
}

const DoubleChartTooltip = ({
  xAxis,
  yAxisFirst,
  yAxisSecond,
  assetFirst,
  assetSecond,
  tooltipName,
  isPeriod,
  dateTooltipFormatter,
  valueTooltipFormatter,
  isLastPlot = false,
}: DoubleChartTootipWrapperProps) => {
  if (xAxis === undefined) {
    return null
  }

  switch (tooltipName) {
    case DOUBLE_AMOUNT_DATE_TOOLTIP:
      return (
        <DoubleAmountDateTooltip
          xAxis={xAxis}
          yAxisFirst={yAxisFirst}
          yAxisSecond={yAxisSecond}
          assetFirst={assetFirst}
          assetSecond={assetSecond}
          isPeriod={isPeriod}
          isLastPlot={isLastPlot}
          dateTooltipFormatter={dateTooltipFormatter}
          valueTooltipFormatter={valueTooltipFormatter}
        />
      )
    default:
      return null
  }
}

export default DoubleChartTooltip
