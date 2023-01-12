import { GradientDiagramPropsType } from './GradientDiagram'

const getMixedColorPart = (prevColorNumber: number, nextColorNumber: number, intervalPersent: number) => {
  return (
    (intervalPersent < 0.5 ? prevColorNumber : nextColorNumber) -
    Math.abs((prevColorNumber - nextColorNumber) * intervalPersent)
  )
}

export const getGradient = ({ colorBreakpoints, currentPersentage }: GradientDiagramPropsType) => {
  let counterFinished = false
  const gradientColorsFillling = colorBreakpoints.reduce<Array<string>>((acc, { persentage, color }, idx, arr) => {
    if (counterFinished === false) {
      if (persentage <= currentPersentage) {
        acc.push(` ${`rgb(${color.r}, ${color.g}, ${color.b})`} ${persentage}%`)
      } else {
        const { color: prevColor, persentage: prevPersentage } = arr[idx - 1]
        const currentIntervalPersentage = (currentPersentage - prevPersentage) / (persentage - prevPersentage)

        const mixedColor = {
          r: getMixedColorPart(prevColor.r, color.r, currentIntervalPersentage),
          g: getMixedColorPart(prevColor.g, color.g, currentIntervalPersentage),
          b: getMixedColorPart(prevColor.b, color.b, currentIntervalPersentage),
        }

        acc.push(` ${`rgb(${mixedColor.r}, ${mixedColor.g}, ${mixedColor.b})`} ${currentPersentage}%`)
        counterFinished = true
      }
    }
    return acc
  }, [])
  
  return `linear-gradient(to right, ${gradientColorsFillling.join(',')})`
}
