import { parseDate } from 'utils/time'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DoubleAmountDateTooltipStyled, MliFeeTooltipStyled } from '../Chart.style'

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
}

const DoubleAmountDateTooltip = ({
  xAxis,
  yAxisFirst,
  yAxisSecond,
  assetFirst,
  assetSecond,
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
        {dateTooltipFormatter?.(xAxis) ?? parseDate({ time: xAxis, timeFormat: 'MMM DD, HH:mm Z' })}
      </div>
    </DoubleAmountDateTooltipStyled>
  )
}

type DoubleChartTootipWrapperProps = DoubleChartTootipProps & {
  xAxis?: number
  tooltipName: DoubleChartTooltipsTypes
}

const DoubleChartTooltip = ({
  xAxis,
  yAxisFirst,
  yAxisSecond,
  assetFirst,
  assetSecond,
  tooltipName,
  dateTooltipFormatter,
  valueTooltipFormatter,
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
          dateTooltipFormatter={dateTooltipFormatter}
          valueTooltipFormatter={valueTooltipFormatter}
        />
      )
    default:
      return null
  }
}

export default DoubleChartTooltip
