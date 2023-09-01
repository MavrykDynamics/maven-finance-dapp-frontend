import { DIAGRAM_COLORS_ARR } from './pieChart.const'

export function createDiagramColorsSingleArray(matrix: string[][]) {
  const numRows = matrix.length
  const numCols = matrix[0].length
  const flattenedArray: string[] = []

  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows; row++) {
      if (matrix[row][col] !== undefined) {
        flattenedArray.push(matrix[row][col])
      }
    }
  }

  return flattenedArray
}

export function getDiagramSectionColor(idx = -1) {
  return DIAGRAM_COLORS_ARR[idx] ?? Math.random().toString(36).slice(5, 7)
}
