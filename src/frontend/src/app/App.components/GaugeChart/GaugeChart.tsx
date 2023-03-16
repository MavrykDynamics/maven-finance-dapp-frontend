import Arrow from './svg/Arrow'
import Backdrop from './svg/Backdrop'
import Gradient from './svg/Gradient'

import { GaugeChartStyled, ArrowStyled, ValueWrapper } from './GaugeChart.style'

type GaugeChartProps = {
  children: React.ReactNode
  maxValue: number
  minValue: number
  currentValue: number
  isReversed?: boolean
}

const MAX_ANGLE = 180
const MIN_ANGLE = 0

const calcArrowAngle = ({
  maxValue,
  currentValue,
  minValue,
}: {
  maxValue: number
  currentValue: number
  minValue: number
}): number => {
  if (currentValue <= minValue) return MIN_ANGLE

  return (currentValue - minValue) * (MAX_ANGLE / (maxValue - minValue))
}

export const calcReversedAngle = ({
  maxValue,
  currentValue,
  minValue,
}: {
  maxValue: number
  currentValue: number
  minValue: number
}): number => {
  if (currentValue <= minValue) return MAX_ANGLE
  return MAX_ANGLE - (currentValue - minValue) * (MAX_ANGLE / (maxValue - minValue))
}

/**
 * For current purposes we need only max value cuz min can be only 0,
 * and also there's no need to handle negative angles for now
 */
export const GaugeChart = ({ children, maxValue, minValue, currentValue, isReversed }: GaugeChartProps) => {
  const angle = Math.max(
    0,
    Math.min(
      180,
      isReversed
        ? calcReversedAngle({ maxValue, currentValue, minValue })
        : calcArrowAngle({ maxValue, currentValue, minValue }),
    ),
  )

  return (
    <GaugeChartStyled>
      <Gradient className="gradient" />
      <Backdrop className="backdrop" />

      <ValueWrapper>{children}</ValueWrapper>
      <ArrowStyled angle={angle}>
        <Arrow />
      </ArrowStyled>
    </GaugeChartStyled>
  )
}
