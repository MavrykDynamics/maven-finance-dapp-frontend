import type { TreasuryBalanceType, TreasuryData, TreaurtGQLData } from './treasury.types'
import { SMVK_TOKEN_ADDRESS, XTZ_TOKEN_ADDRESS } from 'utils/constants'
import { getAssetColor } from './treasury.utils'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

// export const normalizeTreasuryStorage = (sMVKAmounts: Array<Mavryk_User>, treasury: TreasuryGraphQL[]) => {
export const normalizeTreasuryStorage = (data: TreaurtGQLData) => {
  const { mavryk_user: sMVKAmounts, treasury } = data
  const treasuryAssetsColors: Record<string, string> = sMVKAmounts?.length ? { smvk: getAssetColor(0) } : {}

  // Parse sMVK amount for each treasury, to make this structure usable
  const parsedsMVKAmount: TreasuryBalanceType[] = sMVKAmounts?.map(
    ({ smvk_balance, address }: { smvk_balance: number; address: string }): TreasuryBalanceType => ({
      balance: smvk_balance,
      contract: address,
      chartColor: treasuryAssetsColors[SMVK_TOKEN_ADDRESS],
      tokenAddress: SMVK_TOKEN_ADDRESS,
    }),
  )

  // Map every treasury to combine treasury name, and divide balance by constant
  return treasury.reduce<Record<string, TreasuryData>>((acc, treasuryData) => {
    const sMVKAmount = parsedsMVKAmount.find(({ contract }: TreasuryBalanceType) => contract === treasuryData.address)

    // XTZ is present by default for each treasury, and it can't be defined on back-end
    const treasuryWhitelistTokens = [XTZ_TOKEN_ADDRESS].concat(
      treasuryData.whitelist_token_contracts.map(({ contract_address }) => contract_address),
    )

    const treasuryNormalizedTokens = treasuryData.balances
      .reduce<Array<TreasuryBalanceType>>((acc, { balance, token: { metadata, token_address } }) => {
        // get color of the asset
        if (!treasuryAssetsColors[token_address]) {
          treasuryAssetsColors[token_address] = getAssetColor(Object.keys(treasuryAssetsColors).length)
        }

        // Filter zero balance assets in treasury and bad tokens that don't have info or not in whitelist for this treasury
        if (
          !token_address ||
          !metadata ||
          balance <= 0 ||
          balance.toString().includes('e') ||
          !treasuryWhitelistTokens.includes(token_address)
        )
          return acc

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
