import { FarmsQueryQuery } from 'utils/__generated__/graphql'
import { FarmCtxStateType } from '../farms.provider.types'

import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

export const normalizeFarm = (indexerFarm: FarmsQueryQuery['farm'][number]) => {
  return {
    // farm metadata
    address: indexerFarm.address,
    name: indexerFarm.name,
    open: indexerFarm.open,
    lastUpdateTime: indexerFarm.last_updated_at,
    createdTime: indexerFarm.creation_timestamp,
    infinite: indexerFarm.infinite,

    // farm liquidity token
    liquidityTokenBalance: indexerFarm.lp_token_balance,
    liquidityTokenAddress: indexerFarm.lp_token.token_address,

    // farm actions flags
    withdrawPaused: indexerFarm.withdraw_paused,
    claimPaused: indexerFarm.claim_paused,
    depositPaused: indexerFarm.deposit_paused,

    // other
    currentRewardPerBlock: convertNumberForClient({
      number: indexerFarm.current_reward_per_block,
      grade: MVK_DECIMALS,
    }),
    farmDepositors: indexerFarm.farm_accounts.map((farmDepositor) => ({
      address: farmDepositor.user.address,
      participationRewardsPerShare: farmDepositor.participation_rewards_per_share,
      depositedAmount: farmDepositor.deposited_amount,
      rewardsToClaim: farmDepositor.unclaimed_rewards,
    })),
    isMFarm: indexerFarm.is_m_farm,
    // TODO: add address here, no data in indexer for now
    creatorAddress: '',
  }
}

export const normalizeFarms = (indexerFarms: FarmsQueryQuery['farm']) => {
  return indexerFarms.reduce<FarmCtxStateType>(
    (acc, farm) => {
      const normalizedFarm = normalizeFarm(farm)
      const { address, open, liquidityTokenBalance } = normalizedFarm

      const isFarmStaked = liquidityTokenBalance > 0

      acc.farmsMapper[address] = normalizedFarm
      acc.allFarms.push(address)

      if (open === true) {
        acc.allLiveFarms.push(address)
      }

      if (open === true && isFarmStaked) {
        acc.liveStakedFarms.push(address)
      }

      if (open === false) {
        acc.allFinishedFarms.push(address)
      }

      if (open === false && isFarmStaked) {
        acc.finishedStakedFarms.push(address)
      }

      return acc
    },
    {
      farmsMapper: {},
      allFarms: [],
      allLiveFarms: [],
      liveStakedFarms: [],
      allFinishedFarms: [],
      finishedStakedFarms: [],
    },
  )
}
