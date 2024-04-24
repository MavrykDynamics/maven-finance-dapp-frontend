import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { getGradient } from './GradientDiagram.helpers'
import { GradientBreakpoint, GradientDiagramStyled } from './GradientDiagram.style'

export type ColorBreakpoint = {
  percentage: number
  color: {
    r: number
    g: number
    b: number
  }
  value: number
}

export type GradientDiagramPropsType = {
  colorBreakpoints: Array<ColorBreakpoint>
  currentPercentage: number
  className?: string
}

export const GradientDiagram = ({ colorBreakpoints, currentPercentage, className = '' }: GradientDiagramPropsType) => {
  const gradient = getGradient({ colorBreakpoints })

  return (
    <GradientDiagramStyled $gradient={gradient} $gradientWidth={currentPercentage} className={className}>
      {colorBreakpoints.map(({ color, value }) => (
        <GradientBreakpoint
          $background={`rgb(${color.r}, ${color.g}, ${color.b})`}
          key={`rgb(${color.r}, ${color.g}, ${color.b})`}
        >
          <div className="text">
            <CommaNumber value={value} endingText="%" />
          </div>
        </GradientBreakpoint>
      ))}
    </GradientDiagramStyled>
  )
}
