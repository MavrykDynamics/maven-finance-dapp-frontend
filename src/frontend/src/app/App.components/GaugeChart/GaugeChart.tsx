import Arrow from './svg/Arrow'
import Backdrop from './svg/Backdrop'
import Gradient from './svg/Gradient'

import { GaugeChartStyled, ArrowStyled, ValueWrapper } from './GaugeChart.style'
import Progress from './svg/Progress'
import { getNumberInBounds } from 'utils/calcFunctions'

type GaugeChartProps = {
  children: React.ReactNode
  maxValue: number
  minValue: number
  currentValue: number
  isProgress?: boolean
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

export const calcArcAngle = ({
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
 * For current purposes we need to only handle 0 - 180 angles
 */
export const GaugeChart = ({ children, maxValue, minValue, currentValue, isProgress }: GaugeChartProps) => {
  const arrowAngle = getNumberInBounds(0, 180, calcArrowAngle({ maxValue, currentValue, minValue }))
  // negative value for progress offset to place offset on the right side, from end to start
  const progressArcAngle = -getNumberInBounds(0, 180, calcArcAngle({ maxValue, currentValue, minValue }))

  return (
    <GaugeChartStyled>
      <Progress className={`colored-arc ${isProgress ? '' : 'hide'}`} offset={progressArcAngle} />
      {/* passing arcAngle when showing progress arc, to add smooth transition */}
      <Gradient className={`colored-arc ${isProgress ? 'hide' : ''}`} offset={isProgress ? progressArcAngle : 0} />

      <Backdrop className="backdrop" />
      <ValueWrapper>{children}</ValueWrapper>
      <ArrowStyled angle={arrowAngle}>
        <Arrow />
      </ArrowStyled>
    </GaugeChartStyled>
  )
}
