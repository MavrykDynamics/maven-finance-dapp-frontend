// types
import { FarmAccountsType, FarmContractType, FarmGraphQL, Normalizedfarm } from '../../utils/TypesAndInterfaces/Farm'

// helpers
import { getContractBigmapKeys, network } from 'utils/blockchainApi'
import { STAKED } from './Farms.const'
import { State } from 'reducers'
import { Farm_Account } from 'utils/generated/graphqlTypes'

type EndsInType = {
  endsIn: any
  address: string
}[]

type TokensInfoType = {
  lpTokenInfo: {
    liquidityPairToken: {
      tokenAddress: string[]
      token0: {
        symbol: string[]
        tokenAddress: string[]
        thumbnailUri: string
      }
      token1: {
        symbol: string[]
        tokenAddress: string[]
        thumbnailUri: string
      }
    }
  }
  lpTokenUserBalance: number
}[]

export const normalizeFarmStorage = (
  farmList: FarmGraphQL[],
  dipDupTokens: State['tokens']['dipDupTokens'],
  farmCardEndsIn: EndsInType,
  farmLPTokensInfo: TokensInfoType,
  farmContracts: FarmContractType[],
) => {
  if (!farmList?.length) return []

  return farmList.map((farmItem: FarmGraphQL, idx: number) => {
    const endsIn = farmCardEndsIn[idx].endsIn
    const { lpTokenInfo, lpTokenUserBalance } = farmLPTokensInfo[idx]
    const contract = farmContracts.find(
      ({ address }) =>
        lpTokenInfo?.liquidityPairToken?.tokenAddress?.[0] &&
        address === lpTokenInfo?.liquidityPairToken?.tokenAddress?.[0],
    )
    const dipDupToken = dipDupTokens.find(({ contract }) => farmItem.lp_token.token_address === contract)

    return {
      address: farmItem.address,
      name: farmItem.name,
      endsIn: endsIn,
      isLive: Date.now() - new Date(endsIn).getTime() < 0,
      open: farmItem.open,
      withdrawPaused: farmItem.withdraw_paused,
      claimPaused: farmItem.claim_paused,
      depositPaused: farmItem.deposit_paused,
      blocksPerMinute: 0,
      currentRewardPerBlock: farmItem.current_reward_per_block / Math.pow(10, 9),
      farmFactoryId: farmItem.factory_id || '',
      infinite: farmItem.infinite,
      initBlock: farmItem.init_block,
      accumulatedMvkPerShare: 0,
      lastBlockUpdate: farmItem.last_block_update,
      lpTokenUserBalance,
      lpTokenAddress: lpTokenInfo?.liquidityPairToken?.tokenAddress?.[0] ?? '',
      lpBalance: farmItem.lp_token_balance / Math.pow(10, Number(dipDupToken?.metadata.decimals ?? 0)),
      lpToken1: {
        symbol: lpTokenInfo?.liquidityPairToken?.token0?.symbol?.[0],
        address: lpTokenInfo?.liquidityPairToken?.token0?.tokenAddress?.[0],
        thumbnailUri: lpTokenInfo?.liquidityPairToken?.token0?.thumbnailUri,
      },
      lpToken2: {
        symbol: lpTokenInfo?.liquidityPairToken?.token1?.symbol?.[0],
        address: lpTokenInfo?.liquidityPairToken?.token1?.tokenAddress?.[0],
        thumbnailUri: lpTokenInfo?.liquidityPairToken?.token1?.thumbnailUri,
      },
      rewardPerBlock: 0,
      rewardsFromTreasury: false,
      totalBlocks: farmItem.total_blocks,
      farmAccounts: farmItem.farm_accounts,
      farmContract: contract,
    }
  })
}

// helper functions
export const BLOCKS_PER_YEAR = 1051200 // 2 blocks per minute
// TODO: this functions calc apy and apr in LPTOkens, but we need in USD, check with Sam
export const calculateAPY = (currentRewardPerBlock: number, lpTokenBalance: number): number => {
  return lpTokenBalance > 0 ? ((currentRewardPerBlock * BLOCKS_PER_YEAR) / lpTokenBalance) * 100 : 0
}

export const calculateAPR = (currentRewardPerBlock: number, blocksAmount: number, lpTokenBalance: number): number => {
  return lpTokenBalance > 0 ? ((currentRewardPerBlock * blocksAmount) / lpTokenBalance) * 100 : 0
}

export const getSummDepositedAmount = (farmAccounts: Farm_Account[]): number => {
  return farmAccounts.reduce((acc, cur) => acc + cur.deposited_amount, 0)
}

// getting end time for farm cards
export const getEndsInTimestampForFarmCards = async (farmList: FarmGraphQL[]) => {
  try {
    return await Promise.all(
      farmList.map(async (farmCard: { init_block: number; total_blocks: number; address: string }) => {
        const endsIn = await getLvlTimestamp(farmCard.init_block + farmCard.total_blocks)
        return { endsIn, address: farmCard.address }
      }),
    )
  } catch (e: unknown) {
    console.error('getEndsInTimestampForFarmCards fetching error: ', e)
    return []
  }
}

export const getLvlTimestamp = async (blocksLvl: number) => {
  try {
    return await (await fetch(`${process.env.REACT_APP_RPC_TZKT_API}/v1/blocks/${blocksLvl}/timestamp`)).json()
  } catch (e) {
    console.error('getLvlTimestamp fetching error: ', e)
    throw e
  }
}

// getting metadata for liquidity pair coins
export const getLPTokensInfo = async (farmList: FarmGraphQL[]) => {
  try {
    return await Promise.all(
      farmList.map(async ({ address }) => {
        const lpTokenInfo = await getFarmMetadata(address)
        const parsedLpTokenInfo = typeof lpTokenInfo === 'string' ? JSON.parse(lpTokenInfo) : lpTokenInfo

        const lpTokenUserBalance =
          typeof parsedLpTokenInfo === 'object'
            ? Number(await getUserBalanceByAddress(parsedLpTokenInfo?.liquidityPairToken?.tokenAddress?.[0]))
            : 0
        return {
          lpTokenInfo: parsedLpTokenInfo,
          lpTokenUserBalance: lpTokenUserBalance,
        }
      }),
    )
  } catch (e: unknown) {
    console.error('getLPTokensInfo fetching error: ', e)
    return []
  }
}

export async function getFarmMetadata(farmAddress: string) {
  try {
    const farmMetadata = await getContractBigmapKeys(farmAddress, 'metadata')
    const targetMetadataItem =
      farmMetadata.filter((farmItem: { value: string }) => {
        const output = Buffer.from(farmItem.value, 'hex').toString()
        return !output.endsWith('tezos-storage:data')
      })[0] || {}
    const targetFarmMetadataValue = Buffer.from(targetMetadataItem.value, 'hex').toString()

    const parsedMetadataValue = JSON.parse(targetFarmMetadataValue)

    if (!parsedMetadataValue['liquidityPairToken']) {
      throw new Error(`invalid farm metadata: ${farmAddress}`)
    }

    return parsedMetadataValue
  } catch (e) {
    return {
      liquidityPairToken: {
        token0: { symbol: [''], tokenAddress: [''], thumbnailUri: '/images/coin-gold.svg' },
        token1: { symbol: [''], tokenAddress: [''], thumbnailUri: '/images/coin-silver.svg' },
      },
    }
  }
}

// get user tokens balance
export const getUserBalanceByAddress = async (tokenAddress?: string) => {
  if (!tokenAddress) return 0

  return await (await fetch(`https://api.${network}.tzkt.io/v1/accounts/${tokenAddress}/balance`)).json()
}

// filters helpers
export const filterByLiveFinished = (
  farmsToFilter: Array<Normalizedfarm>,
  newLiveFinishedValue: number,
): Array<Normalizedfarm> => {
  return farmsToFilter.filter(({ isLive }) => (newLiveFinishedValue === 1 ? isLive === true : isLive === false))
}

export const filterBySearch = (farmsToFilter: Array<Normalizedfarm>, newSearchText: string): Array<Normalizedfarm> => {
  return farmsToFilter.filter(({ lpTokenAddress, name }) => {
    return (
      lpTokenAddress.toLowerCase().includes(newSearchText.toLowerCase()) ||
      name.toLowerCase().includes(newSearchText.toLowerCase())
    )
  })
}

export const getNewOpenedCardsAddresses = (openedCards: Array<string>, newOpenedCardAddress: string): Array<string> => {
  return openedCards.find((openCardAddress) => openCardAddress === newOpenedCardAddress)
    ? openedCards.filter((openCardAddress) => openCardAddress !== newOpenedCardAddress)
    : openedCards.concat(newOpenedCardAddress)
}

export const filterByStaked = (farmsToFilter: Array<Normalizedfarm>, newStakedValue: number): Array<Normalizedfarm> => {
  return newStakedValue === STAKED
    ? farmsToFilter.filter(
        (item) => item.farmAccounts?.length && item.farmAccounts.some((account) => account?.deposited_amount > 0),
      )
    : farmsToFilter
}

export const sortFarms = (farmsToSort: Array<Normalizedfarm>, sortBy: string): Array<Normalizedfarm> => {
  const dataToSort = [...farmsToSort]
  dataToSort.sort((a, b) => {
    let res = 0
    switch (sortBy) {
      case 'active':
        res = Number(a.open) - Number(b.open)
        break
      case 'highestAPY':
        res =
          calculateAPY(a.currentRewardPerBlock, a.lpBalance) < calculateAPY(b.currentRewardPerBlock, b.lpBalance)
            ? 1
            : -1
        break
      case 'lowestAPY':
        res =
          calculateAPY(a.currentRewardPerBlock, a.lpBalance) > calculateAPY(b.currentRewardPerBlock, b.lpBalance)
            ? 1
            : -1
        break
      case 'highestLiquidity':
        res = a.lpBalance < b.lpBalance ? 1 : -1
        break
      case 'lowestLiquidity':
        res = a.lpBalance > b.lpBalance ? 1 : -1
        break
      case 'yourLargestStake':
        res = getSummDepositedAmount(a.farmAccounts) < getSummDepositedAmount(b.farmAccounts) ? 1 : -1
        break
      case 'rewardsPerBlock':
        res = a.currentRewardPerBlock < b.currentRewardPerBlock ? 1 : -1
        break
      default:
        res = 1
        break
    }
    return res
  })

  return dataToSort
}
