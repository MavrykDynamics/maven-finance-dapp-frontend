import { DIAGRAM_COLORS, DIAGRAM_COLORS_INNER_ARR_LENGTH } from './pieChart.const'

const getDiagramSectionData = (() => {
  let sectionColorIdx = 0
  let section = 0
  let prevIdx = 0

  const arrLength = DIAGRAM_COLORS.length - 1
  const innerArrLength = DIAGRAM_COLORS_INNER_ARR_LENGTH - 1

  return () => {
    if (prevIdx !== arrLength) {
      prevIdx++
    } else {
      prevIdx = 0
    }

    if (section !== innerArrLength) {
      section++
    } else {
      section = 0
    }

    return {
      sectionNumber: section,
      sectionColorIdx,
    }
  }
})()

/**
 * Diagram colors are stored in double array. For now it has 5 arrays of 4 elements
 * By default it will pick colors not in a row, but in column order
 * F.e. pink, blue, purple (NOT  pink, pink2, pink3, pink4, blue, blue2 ....)
 * If you provider index, it will pick colors in a row order
 * F.e. pink, pink1, pink2, pink3, blue, blue2 ...
 * @param section number of colors section (from 0 to 4)
 * @param colorIdx number of color idx inside color section (from 0 to 3)
 * @returns hex representation of color
 */
export function getDiagramSectionColor(idx = -1) {
  if (idx !== -1) return DIAGRAM_COLORS.flat()[idx] ?? Math.random().toString(36).slice(5, 7)
  const { sectionColorIdx, sectionNumber } = getDiagramSectionData()

  return DIAGRAM_COLORS[sectionNumber][sectionColorIdx]
}
