import { ColorBreakpoint } from './GradientDiagram'

const getMixedColorPart = (prevColorNumber: number, nextColorNumber: number, intervalPersent: number) => {
  return (
    (intervalPersent < 0.5 ? prevColorNumber : nextColorNumber) -
    Math.abs((prevColorNumber - nextColorNumber) * intervalPersent)
  )
}

export const getGradient = ({ colorBreakpoints }: { colorBreakpoints: Array<ColorBreakpoint> }) => {
  let counterFinished = false
  const gradientColorsFillling = colorBreakpoints.reduce<Array<string>>((acc, { persentage, color }, idx, arr) => {
    if (counterFinished === false) {
      if (persentage <= 100) {
        acc.push(` ${`rgb(${color.r}, ${color.g}, ${color.b})`} ${persentage}%`)
      } else {
        if (!arr?.[idx - 1]) return acc
        const { color: prevColor, persentage: prevPersentage } = arr?.[idx - 1]
        const currentIntervalPersentage = (100 - prevPersentage) / (persentage - prevPersentage)

        const mixedColor = {
          r: getMixedColorPart(prevColor.r, color.r, currentIntervalPersentage),
          g: getMixedColorPart(prevColor.g, color.g, currentIntervalPersentage),
          b: getMixedColorPart(prevColor.b, color.b, currentIntervalPersentage),
        }

        acc.push(` ${`rgb(${mixedColor.r}, ${mixedColor.g}, ${mixedColor.b})`} ${100}%`)
        counterFinished = true
      }
    }
    return acc
  }, [])

  return `linear-gradient(to right, ${gradientColorsFillling.join(',')})`
}
