import { HIGHLIGHTED_STROKE_WIDTH, DEFAULT_STROKE_WIDTH } from 'app/App.components/PieСhart/pieChart.const'
import { TreasuryBalanceType, TreasuryChartType } from 'utils/TypesAndInterfaces/Treasury'
import { calcPersent } from './treasury.utils'

export const getPieChartData = (
  balances: Array<TreasuryBalanceType>,
  reducedBalance: number,
  hoveredPath: string | null,
) => {
  // when we don't have data for chart
  if (!balances.length) return [{ title: '', value: 1, color: '#ccc' }]

  // need this flag to properly calculate segment value and highlight segment
  let groupedSectorsValue = 0
  let groupedSectorsColor: null | string = null

  const reducedChartData = balances
    .reduce<TreasuryChartType>((acc, item) => {
      // TODO: need this while some assets are test, and i can't fetch their rate
      const tokenUsdValue = item.usdValue || 0
      const tokenPersent = calcPersent(tokenUsdValue, reducedBalance)

      if (tokenPersent < 10) {
        const smallValuesAccIdx = acc.findIndex((item) => item.groupedSmall)
        const smallValuesAccObj = acc?.[smallValuesAccIdx]

        // calculating hover effect on segment
        const isHoveredPathAsset = smallValuesAccObj?.isHoveredPathAsset || hoveredPath === item.symbol

        const smallSectorValue = isHoveredPathAsset
          ? (reducedBalance / 100) * 20
          : groupedSectorsValue + (reducedBalance / 100) * 2

        // if we don't have grouped assets object, create it
        if (!smallValuesAccObj) {
          groupedSectorsValue += tokenUsdValue
          groupedSectorsColor = item.chartColor
          acc.push({
            title: item.symbol,
            value: smallSectorValue,
            color: groupedSectorsColor,
            isHoveredPathAsset,
            segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
            labelPersent: calcPersent(tokenUsdValue, reducedBalance),
            groupedSmall: true,
          })

          return acc
        }

        // if we have grouped assets object and we have one more asset < 10%, just update it's title and balance in the acc
        groupedSectorsValue += tokenUsdValue

        const newSmallValuesObj = {
          ...smallValuesAccObj,
          title: `${smallValuesAccObj.title}, ${item.symbol}`,
          isHoveredPathAsset,
          value: smallSectorValue,
          labelPersent: calcPersent(groupedSectorsValue, reducedBalance),
          segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
        }

        acc.splice(smallValuesAccIdx, 1, newSmallValuesObj)
        return acc
      }

      // if asset is > 10%
      acc.push({
        title: item.symbol,
        value: tokenUsdValue,
        color: item.chartColor,
        isHoveredPathAsset: hoveredPath === item.symbol,
        segmentStroke: hoveredPath === item.symbol ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
        labelPersent: calcPersent(tokenUsdValue, reducedBalance),
        groupedSmall: false,
      })
      return acc
    }, [])
    .map((item, _, arr) => {
      return item.groupedSmall
        ? item
        : { ...item, labelPersent: item.labelPersent - 1 / (groupedSectorsColor ? arr.length - 1 : arr.length - 1) }
    })

  return groupedSectorsColor
    ? reducedChartData.map((item, _, arr) =>
        item.groupedSmall ? item : { ...item, labelPersent: item.labelPersent - 1 / arr.length - 1 },
      )
    : reducedChartData
}
