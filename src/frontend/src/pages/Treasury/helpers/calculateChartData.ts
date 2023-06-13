import { HIGHLIGHTED_STROKE_WIDTH, DEFAULT_STROKE_WIDTH } from 'app/App.components/PieСhart/pieChart.const'
import { TreasuryBalanceType, TreasuryChartType } from 'utils/TypesAndInterfaces/Treasury'
import { calcPersent } from './treasury.utils'
import { VaultAssetData } from 'pages/Vaults/Vaults.helpers'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'

export const getPieChartData = (
  balances: Array<TreasuryBalanceType | VaultAssetData>,
  reducedBalance: number,
  hoveredPath: string | null,
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensRates: TokensContext['tokensPrices'],
) => {
  // when we don't have data for chart
  if (!balances.length) return [{ title: '', value: 1, color: '#ccc' }]

  // if we have 1 asset, return this, cuz when value is so small it will not show properly chart, and sometimes in can be NaN
  if (balances.length === 1) {
    const itemSymbol = tokensMetadata[balances[0].tokenAddress]?.symbol
    return [
      {
        title: itemSymbol,
        value: 1,
        labelPersent: 100,
        color: '#FFC2C3',
        isHoveredPathAsset: hoveredPath === itemSymbol,
        segmentStroke: hoveredPath === itemSymbol ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
      },
    ]
  }

  // need this flag to properly calculate segment value and highlight segment
  let groupedSectorsValue = 0
  let groupedSectorsColor: null | string = null

  return balances.reduce<TreasuryChartType>((acc, item) => {
    const tokenSymbol = tokensMetadata[item.tokenAddress]?.symbol
    const tokenRate = tokensRates[tokenSymbol] ?? 0
    const tokenUsdValue = item.balance * tokenRate
    const tokenPersent = calcPersent(tokenUsdValue, reducedBalance)

    if (tokenPersent < 10 || !tokenUsdValue) {
      const smallValuesAccIdx = acc.findIndex((item) => item.groupedSmall)
      const smallValuesAccObj = acc?.[smallValuesAccIdx]

      // calculating hover effect on segment
      const isHoveredPathAsset = smallValuesAccObj?.isHoveredPathAsset || hoveredPath === tokenSymbol

      const smallSectorValue = isHoveredPathAsset
        ? (reducedBalance / 100) * 20
        : groupedSectorsValue + (reducedBalance / 100) * 2

      // if we don't have grouped assets object, create it
      if (!smallValuesAccObj) {
        groupedSectorsValue += tokenUsdValue
        groupedSectorsColor = item.chartColor
        acc.push({
          title: tokenSymbol,
          value: smallSectorValue,
          color: groupedSectorsColor,
          isHoveredPathAsset,
          segmentStroke: isHoveredPathAsset ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
          labelPersent: tokenPersent,
          groupedSmall: true,
        })

        return acc
      }

      // if we have grouped assets object and we have one more asset < 10%, just update it's title and balance in the acc
      groupedSectorsValue += tokenUsdValue

      const newSmallValuesObj = {
        ...smallValuesAccObj,
        ...(tokenUsdValue < 0.01 ? {} : { color: item.chartColor }),
        title: `${smallValuesAccObj.title}, ${tokenSymbol}`,
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
      title: tokenSymbol,
      value: tokenUsdValue,
      color: item.chartColor,
      isHoveredPathAsset: hoveredPath === tokenSymbol,
      segmentStroke: hoveredPath === tokenSymbol ? HIGHLIGHTED_STROKE_WIDTH : DEFAULT_STROKE_WIDTH,
      labelPersent: tokenPersent,
      groupedSmall: false,
    })
    return acc
  }, [])
}
