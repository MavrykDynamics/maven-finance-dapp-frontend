import type { TreasuryBalanceType, TreasuryData, TreauryGQLData } from './treasury.types'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { getDiagramSectionColor } from 'app/App.components/PieChart/pieChart.utils'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

export const normalizeTreasuryStorage = (data: TreauryGQLData) => {
  const { mavryk_user: sMVKAmounts, treasury } = data
  const treasuryAssetsColors: Record<string, string> = sMVKAmounts?.length ? { smvk: getDiagramSectionColor(0) } : {}

  // Parse sMVK amount for each treasury, to make this structure usable
  const sMVKBalancesMapper = sMVKAmounts?.reduce<Record<string, TreasuryBalanceType>>(
    (acc, { address, smvk_balance }) => {
      acc[address] = {
        balance: smvk_balance,
        contract: address,
        chartColor: treasuryAssetsColors[SMVK_TOKEN_ADDRESS],
        tokenAddress: SMVK_TOKEN_ADDRESS,
      }

      return acc
    },
    {},
  )
  // Map every treasury to combine treasury name, and divide balance by constant
  return treasury.reduce<Record<string, TreasuryData>>((acc, treasuryData, idx) => {
    const sMVKAmount = sMVKBalancesMapper[treasuryData.address] ?? null

    const treasuryNormalizedTokens = treasuryData.balances
      .reduce<Array<TreasuryBalanceType>>((acc, { balance, token: { token_address } }) => {
        // get color of the asset
        if (!treasuryAssetsColors[token_address]) {
          treasuryAssetsColors[token_address] = getDiagramSectionColor(Object.keys(treasuryAssetsColors).length)
          console.log(treasuryAssetsColors)
        }

        // Filter zero balance assets in treasury
        if (!token_address || balance <= 0) return acc

        acc.push({
          contract: treasuryData.address,
          balance,
          chartColor: treasuryAssetsColors[token_address],
          tokenAddress: token_address,
        })

        return acc
      }, [])
      // Add sMVK treasury asset if has
      .concat(sMVKAmount ?? [])

    acc[treasuryData.address] = {
      address: treasuryData.address,
      name:
        treasuryData.name ??
        `Treasury ${treasuryData.address.slice(0, 7)}...${treasuryData.address.slice(
          treasuryData.address.length - 4,
          treasuryData.address.length,
        )}`,
      balances: treasuryNormalizedTokens,
    }

    return acc
  }, {})
}
