import { useMemo } from 'react'

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
import { UserContext } from 'providers/UserProvider/user.provider.types'

type FarmCardProps = {
  farm: FarmRecordType
  isVertical: boolean
  isOpenedCard: boolean
  expandCallback: () => void
  userFarmRewards: NonNullable<UserContext['rewards']>['farmAccounts']
}

export const FarmCard = ({ farm, isVertical, isOpenedCard, userFarmRewards, expandCallback }: FarmCardProps) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  // harvest rewards action ---------------------------
  const harvestRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: HARVEST_FARM_REWARDS_ACTION,
      actionFn: async () => {
        try {
          if (!userAddress) {
            bug('Click Connect in the left menu', 'Please connect your wallet')
            return null
          }

          return await harvestRewards(farm.address, userAddress)
        } catch (e) {
          console.error('harvestRewardsAction', e)
          return null
        }
      },
    }),
    [farm.address, userAddress],
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
        userFarmRewards={userFarmRewards}
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
      userFarmRewards={userFarmRewards}
    />
  )
}
