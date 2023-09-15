import dayjs from 'dayjs'

import { FarmCtxStateType, FarmDepositorType, FarmsIndexerDataType } from '../farms.provider.types'

import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

export const normalizeFarm = (indexerFarm: FarmsIndexerDataType['farm'][number]) => {
  return {
    // farm metadata
    address: indexerFarm.address,
    name: indexerFarm.name,
    open: indexerFarm.open,
    createdTime: indexerFarm.creation_timestamp,
    endsInTime: indexerFarm.end_timestamp ?? null,

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
    farmDepositors: indexerFarm.farm_accounts.reduce<Record<string, FarmDepositorType>>((acc, farmDepositor) => {
      acc[farmDepositor.user.address] = {
        address: farmDepositor.user.address,
        participationRewardsPerShare: farmDepositor.participation_rewards_per_share,
        depositedAmount: farmDepositor.deposited_amount,
        rewardsToClaim: farmDepositor.unclaimed_rewards,
      }
      return acc
    }, {}),
    isMFarm: indexerFarm.is_m_farm,

    // TODO: add address here, no data in indexer for now
    creatorAddress: 'tz1Y2tUUooW6QT6pQCeqz9ep9wCkX5bnKeTs',
  }
}

export const normalizeFarms = (indexerFarms: FarmsIndexerDataType['farm'], userAddress: string | null) => {
  return indexerFarms.reduce<FarmCtxStateType>(
    (acc, farm) => {
      const normalizedFarm = normalizeFarm(farm)
      const { address, open, farmDepositors } = normalizedFarm

      const isFarmStaked = userAddress ? farmDepositors[userAddress] : false

      acc.farmsMapper[address] = normalizedFarm

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
      allLiveFarms: [],
      liveStakedFarms: [],
      allFinishedFarms: [],
      finishedStakedFarms: [],
    },
  )
}
