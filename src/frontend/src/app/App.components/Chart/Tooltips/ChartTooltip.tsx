import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { parseDate } from 'utils/time'
import { TradingViewTooltipStyled } from '../Chart.style'

export const PRICE_DATA_TOOLTIP = 'PriceDateTooltip'
export type CHART_TOOLTIPS_TYPE = typeof PRICE_DATA_TOOLTIP

type TooltipProps = {
  xAxis: number
  yAxis: number
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  asset: string
}

const PriceDateTooltip = ({ xAxis, yAxis, asset, dateTooltipFormatter, valueTooltipFormatter }: TooltipProps) => {
  return (
    <TradingViewTooltipStyled>
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
    </TradingViewTooltipStyled>
  )
}

type TooltipsWrapperProps = Partial<TooltipProps> & {
  tooltipName: CHART_TOOLTIPS_TYPE
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
    case PRICE_DATA_TOOLTIP:
      return (
        <PriceDateTooltip
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
