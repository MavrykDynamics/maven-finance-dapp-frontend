import { useSelector } from 'react-redux'
import { State } from 'reducers'

import Arrow from './svg/Arrow'
import Backdrop from './svg/Backdrop'

import { GaugeChartStyled, ArrowStyled, ValueWrapper } from './GaugeChart.style'
import BackgroundArc, { GRADIENT_NAME } from './svg/BackgroundArc'
import { getNumberInBounds } from 'utils/calcFunctions'
import colors from 'styles/colors'

type GaugeChartProps = {
  children: React.ReactNode
  maxValue: number
  minValue: number
  currentValue: number
  isProgress?: boolean
}

const MAX_ANGLE = 180
const MIN_ANGLE = 0
export const DASH_ARRAY = 185

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
 * @todo: if need add color as a prop
 */
export const GaugeChart = ({ children, maxValue, minValue, currentValue, isProgress }: GaugeChartProps) => {
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const arrowAngle = Math.ceil(getNumberInBounds(0, 180, calcArrowAngle({ maxValue, currentValue, minValue })))
  const progressArcAngle = Math.ceil(getNumberInBounds(0, 180, calcArcAngle({ maxValue, currentValue, minValue })))

  return (
    <GaugeChartStyled>
      <BackgroundArc
        className={`colored-arc`}
        offset={isProgress ? progressArcAngle : 0}
        paint={isProgress ? colors[themeSelected]['gaugeChartColor'] : `url(#${GRADIENT_NAME})`}
      />

      <Backdrop className="backdrop" />
      <ValueWrapper>{children}</ValueWrapper>
      <ArrowStyled angle={arrowAngle}>
        <Arrow />
      </ArrowStyled>
    </GaugeChartStyled>
  )
}
