import { parseDate } from 'utils/time'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { AmountDateTooltipStyled, MliFeeTooltipStyled } from '../Chart.style'

export const AMOUNT_DATA_TOOLTIP = 'AmountDateTooltip'
export const MLI_FEE_TOOLTIP = 'MliFeeTooltip'
export type ChartTooltipsTypes = typeof AMOUNT_DATA_TOOLTIP | typeof MLI_FEE_TOOLTIP

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

const MliFeeTooltip = ({ xAxis, yAxis, asset, dateTooltipFormatter, valueTooltipFormatter }: TooltipProps) => {
  return (
    <MliFeeTooltipStyled>
      <div>
        <div className="name">Fee:</div>
        <CommaNumber
          endingText={asset}
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(yAxis)) : yAxis}
          showDecimal
          decimalsToShow={2}
          className="value"
        />
      </div>
      <div>
        <div className="name">MLI:</div>
        <CommaNumber
          endingText={asset}
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(xAxis)) : xAxis}
          showDecimal
          decimalsToShow={2}
          className="value"
        />
      </div>
    </MliFeeTooltipStyled>
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
    case MLI_FEE_TOOLTIP:
      return (
        <MliFeeTooltip
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
