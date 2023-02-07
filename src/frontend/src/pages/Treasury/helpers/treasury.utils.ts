import { TREASURYS_COLORS } from 'app/App.components/PieСhart/pieChart.const'

export const calcPersent = (number: number, wholeSum: number) => number / (wholeSum / 100)
export const getAssetColor = (assetIdx: number) =>
  assetIdx < TREASURYS_COLORS.length ? TREASURYS_COLORS[assetIdx] : Math.random().toString(36).slice(5, 7)
