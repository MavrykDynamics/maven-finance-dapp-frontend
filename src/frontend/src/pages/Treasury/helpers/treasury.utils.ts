import { TREASURYS_COLORS } from 'app/App.components/PieСhart/pieChart.const'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient } from 'utils/calcFunctions'

import { TreasuryType, TreasuryBalanceType } from 'utils/TypesAndInterfaces/Treasury'

export const getAssetColor = (assetIdx: number) =>
  assetIdx < TREASURYS_COLORS.length ? TREASURYS_COLORS[assetIdx] : Math.random().toString(36).slice(5, 7)

/**
 * @param treasuryData array of treasuries
 * @returns object that represent token address and amount of that token in all treasuries, AMOUNT is not converted
 */
export const reduceTreasuryAssets = (treasuryData: TreasuryType) => {
  return treasuryData.reduce<Record<string, TreasuryBalanceType>>((acc, { balances }) => {
    balances.forEach((balanceAsset) => {
      if (acc[balanceAsset.tokenAddress]) {
        acc[balanceAsset.tokenAddress].balance += balanceAsset.balance
      } else {
        acc[balanceAsset.tokenAddress] = { ...balanceAsset }
      }
    })

    return acc
  }, {})
}

/**
 *
 * @param treasury treasury obj
 * @param tokensMetadata mapper of tokens metadata
 * @param tokensPrices mapper of token prices
 * @returns sum of all tokens in $ for all passed treasury, SUM is converted to USD
 */
export const getTreasuryTVL = (
  treasury: TreasuryType[number],
  tokensMetadata: TokensContext['tokensMetadata'],
  tokensPrices: TokensContext['tokensPrices'],
) =>
  treasury.balances.reduce((treasuryTVLacc, { balance, tokenAddress }) => {
    const treasuryToken = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
    if (!treasuryToken || !treasuryToken.rate) return treasuryTVLacc

    const { decimals, rate } = treasuryToken
    return (treasuryTVLacc += convertNumberForClient({ number: balance, grade: decimals }) * rate)
  }, 0)
