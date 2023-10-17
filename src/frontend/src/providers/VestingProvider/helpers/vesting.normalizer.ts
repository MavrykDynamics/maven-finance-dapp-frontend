import { VestingRecord } from './vesting.types'
import { GetVestingQueryQuery, Vesting_Vestee } from 'utils/__generated__/graphql'

import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

export function normalizeVestingStorage(storage: GetVestingQueryQuery) {
  const vesteeRecord = storage.vesting[0]

  const { vesteesMapper = {}, vesteesAddresses = [] } =
    vesteeRecord?.vestees.reduce<{
      vesteesMapper: Record<Vesting_Vestee['vestee']['address'], VestingRecord>
      vesteesAddresses: Array<string>
    }>(
      (acc, vestee) => {
        acc.vesteesAddresses.push(vestee.vestee.address)
        acc.vesteesMapper[vestee.vestee.address] = {
          address: vestee.vestee.address,
          totalRemainded: convertNumberForClient({ number: vestee.total_remainder, grade: MVK_DECIMALS }),
          totalAllocated: convertNumberForClient({ number: vestee.total_allocated_amount, grade: MVK_DECIMALS }),
          rewardPerMonth: vestee.claim_amount_per_month,
          cliffMonth: vestee.cliff_months,
          vestingMonth: vestee.vesting_months,
          nextRewardDate: vestee.next_redemption_timestamp,
          lastClaimDate: vestee.last_claimed_timestamp,
          cliffTimeEnd: vestee.end_cliff_timestamp,
          isLocked: vestee.locked,
        }
        return acc
      },
      {
        vesteesMapper: {},
        vesteesAddresses: [],
      },
    ) ?? {}

  return {
    address: vesteeRecord?.address ?? '',
    totalVestedAmount: vesteeRecord?.total_vested_amount ?? 0,
    totalClaimedAmount: vesteeRecord?.vestees_aggregate?.aggregate?.sum?.total_claimed ?? 0,
    vesteesMapper,
    vesteesAddresses,
  }
}
