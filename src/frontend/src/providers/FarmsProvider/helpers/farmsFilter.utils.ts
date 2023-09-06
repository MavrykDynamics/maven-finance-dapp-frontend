import { FarmsCtxType } from '../farms.provider.types'
import { calculateAPY, getFarmUserDepositedAmount } from './farms.utils'

// filter farms by including search input value as substring in lp token address or in name
export const filterBySearch = (
  farmsToFilter: Array<string>,
  farmsMapper: FarmsCtxType['farmsMapper'],
  newSearchText: string,
) =>
  farmsToFilter.filter((farmAddress) => {
    const { liquidityTokenAddress, name } = farmsMapper[farmAddress]
    return (
      liquidityTokenAddress.toLowerCase().includes(newSearchText.toLowerCase()) ||
      name.toLowerCase().includes(newSearchText.toLowerCase())
    )
  })

/**
 * sort farms by
 * 1. live / finished
 * 2. from highest APY to lowest APY
 * 3. from lowest APY to highest APY
 * 4. from highest balance to lowest balance
 * 5. from lowest balance to highest balance
 * 6. from highest your deposited amount to lowest your deposited amount
 * 7. from highest reward per block to lowest reward per block
 */
export const sortFarms = ({
  farmsIds,
  farmsMapper,
  sortBy,
  userAddress,
}: {
  farmsIds: Array<string>
  farmsMapper: FarmsCtxType['farmsMapper']
  sortBy: string
  userAddress: string | null
}) =>
  [...farmsIds].sort((farmA_address, farmB_address) => {
    const farmA = farmsMapper[farmA_address]
    const farmB = farmsMapper[farmB_address]
    let res = 0
    switch (sortBy) {
      case 'active':
        res = Number(farmA.open) - Number(farmB.open)
        break
      case 'highestAPY':
        res =
          calculateAPY(farmA.currentRewardPerBlock, farmA.liquidityTokenBalance) <
          calculateAPY(farmB.currentRewardPerBlock, farmB.liquidityTokenBalance)
            ? 1
            : -1
        break
      case 'lowestAPY':
        res =
          calculateAPY(farmA.currentRewardPerBlock, farmA.liquidityTokenBalance) >
          calculateAPY(farmB.currentRewardPerBlock, farmB.liquidityTokenBalance)
            ? 1
            : -1
        break
      case 'highestLiquidity':
        res = farmA.liquidityTokenBalance < farmB.liquidityTokenBalance ? 1 : -1
        break
      case 'lowestLiquidity':
        res = farmA.liquidityTokenBalance > farmB.liquidityTokenBalance ? 1 : -1
        break
      case 'yourLargestStake':
        res =
          getFarmUserDepositedAmount(farmA.farmDepositors, userAddress) <
          getFarmUserDepositedAmount(farmB.farmDepositors, userAddress)
            ? 1
            : -1
        break
      case 'rewardsPerBlock':
        res = farmA.currentRewardPerBlock < farmB.currentRewardPerBlock ? 1 : -1
        break
      default:
        res = 1
        break
    }
    return res
  })

// generate new array of opened farms, to store in url
export const getNewOpenedCardsAddresses = (openedCards: Array<string>, newOpenedCardAddress: string): Array<string> => {
  return openedCards.find((openCardAddress) => openCardAddress === newOpenedCardAddress)
    ? openedCards.filter((openCardAddress) => openCardAddress !== newOpenedCardAddress)
    : openedCards.concat(newOpenedCardAddress)
}
