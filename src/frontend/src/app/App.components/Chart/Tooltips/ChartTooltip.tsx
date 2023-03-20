import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { parseDate } from 'utils/time'
import { TradingViewTooltipStyled } from '../Chart.style'

type TooltipPropsType = {
  xAxis?: number
  yAxis?: number
  dateTooltipFormatter?: (date: number) => string
  valueTooltipFormatter?: (date: number) => string
  asset: string
}

export const PRICE_DATA_TOOLTIP = 'PriceDateTooltip'

export type CHART_TOOLTIPS_TYPE = typeof PRICE_DATA_TOOLTIP

const PriceDateTooltip = ({ xAxis, yAxis, asset, dateTooltipFormatter, valueTooltipFormatter }: TooltipPropsType) => {
  if (xAxis === undefined || yAxis === undefined) {
    return null
  }

  return (
    <TradingViewTooltipStyled>
      <div className="value">
        <CommaNumber endingText={asset} value={xAxis} showDecimal decimalsToShow={6} />
      </div>
      <div className="date">
        {dateTooltipFormatter?.(yAxis) ?? parseDate({ time: yAxis, timeFormat: 'MMM DD, HH:mm Z' })}
      </div>
    </TradingViewTooltipStyled>
  )
}

const ChartTooltip = ({
  xAxis,
  yAxis,
  asset,
  tooltipName,
  dateTooltipFormatter,
  valueTooltipFormatter,
}: TooltipPropsType & { tooltipName: CHART_TOOLTIPS_TYPE }) => {
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
