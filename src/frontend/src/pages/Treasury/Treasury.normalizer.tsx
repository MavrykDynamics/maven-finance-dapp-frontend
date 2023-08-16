import { VestingRecord } from 'reducers/vesting'
import { Vesting_Vestee } from 'utils/__generated__/graphql'
import { VestingGraphQL } from 'utils/TypesAndInterfaces/Vesting'

import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

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
