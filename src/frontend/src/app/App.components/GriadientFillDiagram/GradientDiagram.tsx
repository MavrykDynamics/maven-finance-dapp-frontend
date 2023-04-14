import { CommaNumber } from '../CommaNumber/CommaNumber.controller'
import { getGradient } from './GradientDiagram.helpers'
import { GradientBreakpoint, GradientDiagramStyled } from './GradientDiagram.style'

export type ColorBreakpoint = {
  persentage: number
  color: {
    r: number
    g: number
    b: number
  }
  value: number
}

export type GradientDiagramPropsType = {
  colorBreakpoints: Array<ColorBreakpoint>
  currentPersentage: number
  className?: string
}

// because we cut the background inside the diagram instead of
// calculating the gradient for different percentages

export const GradientDiagram = ({ colorBreakpoints, currentPersentage, className = '' }: GradientDiagramPropsType) => {
  const gradient = getGradient({ colorBreakpoints })

  return (
    <GradientDiagramStyled gradient={gradient} gradientWidth={currentPersentage} className={className}>
      {colorBreakpoints.map(({ color, value }) => (
        <GradientBreakpoint
          background={`rgb(${color.r}, ${color.g}, ${color.b})`}
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
