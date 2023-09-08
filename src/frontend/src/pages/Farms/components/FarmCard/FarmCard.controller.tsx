import { useCallback, useMemo } from 'react'

// view
import { VerticalFarmCard } from './VerticalFarmCard'
import { HorizontalFarmCard } from './HorizonralFarmCard'

// utils
import { checkWhetherTokenIsFarmToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { harvestRewards } from 'providers/FarmsProvider/actions/farms.actions'

// hooks
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { HARVEST_FARM_REWARDS_ACTION } from 'providers/FarmsProvider/helpers/farms.const'

// types
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'

type FarmCardProps = {
  farm: FarmRecordType
  isVertical: boolean
  isOpenedCard: boolean
  expandCallback: () => void
}

export const FarmCard = ({ farm, isVertical, isOpenedCard, expandCallback }: FarmCardProps) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  // harvest rewards action ---------------------------
  const harvestRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    return await harvestRewards(farm.address)
  }, [farm.address, userAddress])

  const harvestRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: HARVEST_FARM_REWARDS_ACTION,
      actionFn: harvestRewardsAction,
    }),
    [harvestRewardsAction],
  )

  const { action: handleHarvestRewards } = useContractAction(harvestRewardsContractActionProps)

  const farmToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: farm?.liquidityTokenAddress })
  if (!farmToken || !checkWhetherTokenIsFarmToken(farmToken)) return null

  if (isVertical) {
    return (
      <VerticalFarmCard
        farm={farm}
        farmToken={farmToken}
        isCardOpened={isOpenedCard}
        harvestRewards={handleHarvestRewards}
        expandCallback={expandCallback}
      />
    )
  }

  return (
    <HorizontalFarmCard
      farm={farm}
      farmToken={farmToken}
      isCardOpened={isOpenedCard}
      harvestRewards={handleHarvestRewards}
      expandCallback={expandCallback}
    />
  )
}
