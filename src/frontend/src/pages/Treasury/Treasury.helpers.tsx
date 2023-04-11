import { VestingRecord } from 'reducers/vesting'
import { Vesting_Vestee } from 'utils/generated/graphqlTypes'
import { VestingGraphQL } from 'utils/TypesAndInterfaces/Vesting'
import type {
  TreasuryGraphQL,
  TreasuryFactoryGraphQL,
  TreasuryType,
  TreasuryBalanceType,
} from '../../utils/TypesAndInterfaces/Treasury'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

export function normalizeTreasury(storage: {
  treasury: TreasuryGraphQL[]
  treasury_factory: TreasuryFactoryGraphQL[]
}) {
  return {
    treasuryAddresses: storage.treasury,
    treasuryFactoryAddress: storage.treasury_factory[0].address,
  }
}

export const reduceTreasuryAssets = (
  treasuryData: TreasuryType[],
): { assetsBalances: Array<TreasuryBalanceType>; globalTreasuryTVL: number } => {
  const { assets, globalTreasuryTVL } = treasuryData.reduce<{
    assets: Record<string, TreasuryBalanceType>
    globalTreasuryTVL: number
  }>(
    (acc, { balances, treasuryTVL }) => {
      balances.forEach((balanceAsset) => {
        if (acc.assets[balanceAsset.symbol]) {
          acc.assets[balanceAsset.symbol].balance += balanceAsset.balance
          acc.assets[balanceAsset.symbol].usdValue += Number(balanceAsset.usdValue)
        } else {
          acc.assets[balanceAsset.symbol] = { ...balanceAsset }
        }
      })

      acc.globalTreasuryTVL += treasuryTVL
      return acc
    },
    { assets: {}, globalTreasuryTVL: 0 },
  )

  return { assetsBalances: Object.values(assets), globalTreasuryTVL }
}

export function normalizeVestingStorage(storage?: VestingGraphQL | null) {
  const { vesteesMapper = {}, vesteeIds = [] } =
    storage?.vestees.reduce<{
      vesteesMapper: Record<Vesting_Vestee['vestee_id'], VestingRecord>
      vesteeIds: Array<string>
    }>(
      (acc, vestee) => {
        acc.vesteeIds.push(vestee.vestee_id)
        acc.vesteesMapper[vestee.vestee_id] = {
          address: vestee.vestee_id,
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
    address: storage?.address || '',
    totalVestedAmount: storage?.total_vested_amount ?? 0,
    totalClaimedAmount: storage?.vestees_aggregate?.aggregate?.sum?.total_claimed ?? 0,
    vesteesMapper,
    vesteeIds,
  }
}
