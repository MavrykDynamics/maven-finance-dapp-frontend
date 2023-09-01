import { DIAGRAM_COLORS_ARR } from './pieChart.const'

export function getDiagramSectionColor(idx = -1) {
  return DIAGRAM_COLORS_ARR[idx] ?? Math.random().toString(36).slice(5, 7)
}
