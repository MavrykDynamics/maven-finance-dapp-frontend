import { TREASURYS_COLORS } from 'app/App.components/PieСhart/pieChart.const'
import { getNumberInBounds } from 'utils/calcFunctions'

export const calcPersent = (number: number, wholeSum: number) =>
  getNumberInBounds(0, 100, number / Math.max(wholeSum / 100, 1))

export const getAssetColor = (assetIdx: number) =>
  assetIdx < TREASURYS_COLORS.length ? TREASURYS_COLORS[assetIdx] : Math.random().toString(36).slice(5, 7)
