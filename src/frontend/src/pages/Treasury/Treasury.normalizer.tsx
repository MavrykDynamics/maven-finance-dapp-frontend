import { VestingRecord } from 'reducers/vesting'
import { Mavryk_User, Vesting_Vestee } from 'utils/generated/graphqlTypes'
import { VestingGraphQL } from 'utils/TypesAndInterfaces/Vesting'
import type { TreasuryGraphQL, TreasuryBalanceType } from '../../utils/TypesAndInterfaces/Treasury'

import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { getAssetColor } from './helpers/treasury.utils'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

export function normalizeVestingStorage(storage?: VestingGraphQL | null) {
  const { vesteesMapper = {}, vesteeIds = [] } =
    storage?.vestees.reduce<{
      vesteesMapper: Record<Vesting_Vestee['vestee']['address'], VestingRecord>
      vesteeIds: Array<string>
    }>(
      (acc, vestee) => {
        acc.vesteeIds.push(vestee.vestee.address)
        acc.vesteesMapper[vestee.vestee.address] = {
          address: vestee.vestee.address,
          totalRemainded: convertNumberForClient({ number: vestee.total_remainder, grade: MVK_DECIMALS }),
          totalAllocated: convertNumberForClient({ number: vestee.total_allocated_amount, grade: MVK_DECIMALS }),
          rewardPerMonth: vestee.claim_amount_per_month,
          cliffMonth: vestee.cliff_months,
          vestingMonth: vestee.vesting_months,
          nextRewardDate: vestee.next_redemption_timestamp,
          lastClaimDate: vestee.last_claimed_timestamp,
        }
        return acc
      },
      {
        vesteesMapper: {},
        vesteeIds: [],
      },
    ) ?? {}

  return {
    address: storage?.address ?? '',
    totalVestedAmount: storage?.total_vested_amount ?? 0,
    totalClaimedAmount: storage?.vestees_aggregate?.aggregate?.sum?.total_claimed ?? 0,
    vesteesMapper,
    vesteeIds,
  }
}

export const normalizeTreasuryStorage = (sMVKAmounts: Array<Mavryk_User>, treasury: TreasuryGraphQL[]) => {
  const treasuryAssetsColors: Record<string, string> = sMVKAmounts?.length ? { smvk: getAssetColor(0) } : {}

  // Parse sMVK amount for each treasury, to make this structure usable
  const parsedsMVKAmount: TreasuryBalanceType[] = sMVKAmounts?.map(
    ({ smvk_balance, address }: { smvk_balance: number; address: string }): TreasuryBalanceType => ({
      balance: smvk_balance,
      contract: address,
      chartColor: treasuryAssetsColors['smvk'],
      tokenAddress: '',
    }),
  )

  // Map every treasury to combine treasury name, and divide balance by constant
  return treasury.map((treasuryData) => {
    const sMVKAmount = parsedsMVKAmount.find(({ contract }: TreasuryBalanceType) => contract === treasuryData.address)

    // XTZ is present by default for each treasury, and it can't be defined on back-end
    const treasuryWhitelistTokens = ['XTZ'].concat(
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

    return {
      address: treasuryData.address,
      name:
        treasuryData.name ??
        `Treasury ${treasuryData.address.slice(0, 7)}...${treasuryData.address.slice(
          treasuryData.address.length - 4,
          treasuryData.address.length,
        )}`,
      balances: treasuryNormalizedTokens,
    }
  })
}
