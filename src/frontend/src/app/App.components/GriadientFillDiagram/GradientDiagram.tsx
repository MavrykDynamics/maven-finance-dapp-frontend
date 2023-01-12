import { getGradient } from './GradientDiagram.helpers'
import { GradientBreakpoint, GradientDiagramStyled } from './GradientDiagram.style'

export type ColorBreakpoint = {
  persentage: number
  color: {
    r: number
    g: number
    b: number
  }
}

export type GradientDiagramPropsType = {
  colorBreakpoints: Array<ColorBreakpoint>
  currentPersentage: number
  className?: string
}

export const GradientDiagram = ({ colorBreakpoints, currentPersentage, className = '' }: GradientDiagramPropsType) => {
  const gradient = getGradient({ colorBreakpoints, currentPersentage })

  return (
    <GradientDiagramStyled gradient={gradient} gradientWidth={currentPersentage} className={className}>
      {colorBreakpoints.map(({ color }) => (
        <GradientBreakpoint background={`rgb(${color.r}, ${color.g}, ${color.b})`} />
      ))}
    </GradientDiagramStyled>
  )
}
