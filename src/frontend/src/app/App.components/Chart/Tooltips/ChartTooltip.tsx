import { parseDate } from 'utils/time'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { AmountDateTooltipStyled } from '../Chart.style'

export const AMOUNT_DATA_TOOLTIP = 'AmountDateTooltip'
export type ChartTooltipsTypes = typeof AMOUNT_DATA_TOOLTIP

type TooltipProps = {
  xAxis: number
  yAxis: number
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  asset: string
}

const AmountDateTooltip = ({ xAxis, yAxis, asset, dateTooltipFormatter, valueTooltipFormatter }: TooltipProps) => {
  return (
    <AmountDateTooltipStyled>
      <div className="value">
        <CommaNumber
          endingText={asset}
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(xAxis)) : xAxis}
          showDecimal
          decimalsToShow={6}
        />
      </div>
      <div className="date">
        {dateTooltipFormatter?.(yAxis) ?? parseDate({ time: yAxis, timeFormat: 'MMM DD, HH:mm Z' })}
      </div>
    </AmountDateTooltipStyled>
  )
}

type TooltipsWrapperProps = Partial<TooltipProps> & {
  tooltipName: ChartTooltipsTypes
  asset: string
}

const ChartTooltip = ({
  xAxis,
  yAxis,
  asset,
  tooltipName,
  dateTooltipFormatter,
  valueTooltipFormatter,
}: TooltipsWrapperProps) => {
  if (xAxis === undefined || yAxis === undefined) {
    return null
  }

  switch (tooltipName) {
    case AMOUNT_DATA_TOOLTIP:
      return (
        <AmountDateTooltip
          xAxis={xAxis}
          yAxis={yAxis}
          asset={asset}
          dateTooltipFormatter={dateTooltipFormatter}
          valueTooltipFormatter={valueTooltipFormatter}
        />
      )
    default:
      return null
  }
}

export default ChartTooltip
