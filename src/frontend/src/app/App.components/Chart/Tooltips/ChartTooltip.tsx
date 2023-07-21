import { parseDate } from 'utils/time'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { AmountDateTooltipStyled, MliFeeTooltipStyled } from '../Chart.style'

export const AMOUNT_DATE_TOOLTIP = 'AmountDateTooltip'
export const CURRENCY_AMOUNT_DATE_TOOLTIP = 'CurrencyAmountDateTooltip'
export const MLI_FEE_TOOLTIP = 'MliFeeTooltip'
export type ChartTooltipsTypes =
  | typeof AMOUNT_DATE_TOOLTIP
  | typeof MLI_FEE_TOOLTIP
  | typeof CURRENCY_AMOUNT_DATE_TOOLTIP

type TooltipProps = {
  xAxis: number
  yAxis: number
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  asset: string
  isCurrency?: boolean
  isPeriod: boolean
  isLastPlot: boolean
}

const AmountDateTooltip = ({
  xAxis,
  yAxis,
  asset,
  isCurrency,
  isPeriod,
  isLastPlot,
  dateTooltipFormatter,
  valueTooltipFormatter,
}: TooltipProps) => {
  return (
    <AmountDateTooltipStyled>
      <div className="value">
        <CommaNumber
          endingText={isCurrency ? undefined : asset}
          beginningText={isCurrency ? asset : undefined}
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(xAxis)) : xAxis}
          showDecimal
          decimalsToShow={6}
        />
      </div>
      <div className="date">
        {dateTooltipFormatter?.(yAxis) ??
          parseDate({ time: yAxis, timeFormat: isPeriod && !isLastPlot ? 'MMM DD' : 'MMM DD, HH:mm Z' })}
      </div>
    </AmountDateTooltipStyled>
  )
}

const MliFeeTooltip = ({ xAxis, yAxis, asset, valueTooltipFormatter }: TooltipProps) => {
  return (
    <MliFeeTooltipStyled>
      <div>
        <div className="name">Fee:</div>
        <CommaNumber
          endingText={asset}
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(xAxis)) : xAxis}
          showDecimal
          decimalsToShow={4}
          className="value"
        />
      </div>
      <div>
        <div className="name">MLI:</div>
        <CommaNumber
          value={valueTooltipFormatter ? parseFloat(valueTooltipFormatter(yAxis)) : yAxis}
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
  isLastPlot = false,
  isPeriod = false,
}: TooltipsWrapperProps) => {
  if (xAxis === undefined || yAxis === undefined) {
    return null
  }

  switch (tooltipName) {
    case AMOUNT_DATE_TOOLTIP:
      return (
        // Amount of asset we show in format 100 XTZ
        <AmountDateTooltip
          xAxis={xAxis}
          yAxis={yAxis}
          asset={asset}
          isPeriod={isPeriod}
          isLastPlot={isLastPlot}
          dateTooltipFormatter={dateTooltipFormatter}
          valueTooltipFormatter={valueTooltipFormatter}
        />
      )
    case CURRENCY_AMOUNT_DATE_TOOLTIP:
      return (
        // Amount of currency we show in format $ 100
        <AmountDateTooltip
          xAxis={xAxis}
          yAxis={yAxis}
          asset={asset}
          isPeriod={isPeriod}
          isLastPlot={isLastPlot}
          isCurrency
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
          isPeriod={false}
          isLastPlot={false}
          dateTooltipFormatter={dateTooltipFormatter}
          valueTooltipFormatter={valueTooltipFormatter}
        />
      )
    default:
      return null
  }
}

export default ChartTooltip
