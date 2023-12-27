import type { TreasuryBalanceType, TreasuryData, TreasuryGQLData } from './treasury.types'
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { getDiagramSectionColor } from 'app/App.components/PieChart/pieChart.utils'

export const MIN_TREASURY_PERCENT_TO_DISPLAY = 0.1

export const normalizeTreasuryStorage = (data: TreasuryGQLData) => {
  const { mavryk_user: sMVNAmounts, treasury } = data
  const treasuryAssetsColors: Record<string, string> = sMVNAmounts?.length ? { smvn: getDiagramSectionColor(0) } : {}

  // Parse sMVN amount for each treasury, to make this structure usable
  const sMVNBalancesMapper = sMVNAmounts?.reduce<Record<string, TreasuryBalanceType>>(
    (acc, { address, smvk_balance }) => {
      acc[address] = {
        balance: smvk_balance,
        contract: address,
        chartColor: treasuryAssetsColors[SMVN_TOKEN_ADDRESS],
        tokenAddress: SMVN_TOKEN_ADDRESS,
      }

      return acc
    },
    {},
  )
  // Map every treasury to combine treasury name, and divide balance by constant
  return treasury.reduce<Record<string, TreasuryData>>((acc, treasuryData, idx) => {
    const sMVNAmount = sMVNBalancesMapper[treasuryData.address] ?? null

    const treasuryNormalizedTokens = treasuryData.balances
      .reduce<Array<TreasuryBalanceType>>((acc, { balance, token: { token_address } }) => {
        // get color of the asset
        if (!treasuryAssetsColors[token_address]) {
          treasuryAssetsColors[token_address] = getDiagramSectionColor(Object.keys(treasuryAssetsColors).length)
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
      // Add sMVN treasury asset if has
      .concat(sMVNAmount ?? [])

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
