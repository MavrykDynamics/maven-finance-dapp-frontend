import { VestingRecord } from 'reducers/vesting'
import { Mavryk_User, Vesting_Vestee } from 'utils/generated/graphqlTypes'
import { VestingGraphQL } from 'utils/TypesAndInterfaces/Vesting'
import type {
  TreasuryGraphQL,
  TreasuryFactoryGraphQL,
  TreasuryType,
  TreasuryBalanceType,
  TreasuryAssetMapperType,
} from '../../utils/TypesAndInterfaces/Treasury'
import { convertNumberForClient } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'
import { getAssetColor } from './helpers/treasury.utils'
import { State } from 'reducers'
import { isTezosAsset } from 'pages/Loans/Loans.helpers'

export const MIN_TREASURY_PERSENT_TO_DISPLAY = 0.1

export function normalizeTreasury(storage: {
  treasury: TreasuryGraphQL[]
  treasury_factory: TreasuryFactoryGraphQL[]
}) {
  return {
    treasury: storage.treasury,
    treasuryFactoryAddress: storage.treasury_factory[0].address,
  }
}

export const reduceTreasuryAssets = (
  treasuryData: TreasuryType,
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

export const normalizeTreasuryStorage = (
  sMVKAmounts: Array<Mavryk_User>,
  treasury: TreasuryGraphQL[],
  mvkRate: number,
  tokenPrices: State['tokens']['tokensPrices'],
) => {
  const treasuryAssetsColors: Record<string, string> = sMVKAmounts?.length ? { smvk: getAssetColor(0) } : {}

  // Parse sMVK amount for each treasury, to make this structure usable
  const parsedsMVKAmount: TreasuryBalanceType[] = sMVKAmounts?.map(
    ({ smvk_balance, address }: { smvk_balance: number; address: string }): TreasuryBalanceType => ({
      balance: smvk_balance,
      usdValue: smvk_balance * mvkRate,
      decimals: 9,
      contract: address,
      name: 'Staked MAVRYK',
      symbol: 'sMVK',
      icon: 'https://mavryk.finance/logo192.png',
      rate: mvkRate,
      chartColor: treasuryAssetsColors['smvk'],
      tokenAddress: '',
    }),
  )

  // Map every treasury to combine treasury name, and divide balance by constant
  const mappedTreasuries = treasury.map((treasuryData) => {
    const sMVKAmount = parsedsMVKAmount.find(({ contract }: TreasuryBalanceType) => contract === treasuryData.address)

    // XTZ is present by default for each treasury, and it can't be defined on back-end
    const treasuryWhitelistTokens = ['XTZ'].concat(
      treasuryData.whitelist_token_contracts.map(({ contract_address }) => contract_address),
    )

    const treasuryNormalizedTokens = treasuryData.balances
      .reduce<Array<TreasuryBalanceType>>((acc, { balance, metadata, token_address }) => {
        // metadata has no type in indexer types so use 'as'
        const { symbol = '', decimals = '0', icon = '' } = (metadata ?? {}) as TreasuryAssetMapperType
        const parsedDecimals = parseInt(decimals)

        const coinsAmount = convertNumberForClient({ number: balance, grade: parsedDecimals })

        const treasurySymbolToGetBalance = isTezosAsset(symbol.toLowerCase()) ? 'tezos' : symbol.toLowerCase()

        // get rates from feeds or no rate
        const rate =
          treasurySymbolToGetBalance === 'mvk' || treasurySymbolToGetBalance === 'smvk'
            ? mvkRate
            : tokenPrices[treasurySymbolToGetBalance] ?? null

        // get color of the asset
        if (!treasuryAssetsColors[symbol.toLowerCase()]) {
          treasuryAssetsColors[symbol.toLowerCase()] = getAssetColor(Object.keys(treasuryAssetsColors).length)
        }

        // Filter zero balance assets in treasury and bad tokens that don't have info or not in whitelist for this treasury
        if (
          !symbol ||
          balance <= 0 ||
          balance.toString().includes('e') ||
          !treasuryWhitelistTokens.includes(token_address)
        )
          return acc

        acc.push({
          icon,
          rate,
          contract: treasuryData.address,
          usdValue: coinsAmount * (rate ?? 1),
          decimals: parsedDecimals,
          name: isTezosAsset(symbol.toLowerCase()) ? 'XTZ' : symbol,
          symbol: symbol,
          balance: coinsAmount,
          chartColor: treasuryAssetsColors[symbol.toLowerCase()],
          tokenAddress: token_address,
        })

        return acc
      }, [])
      // Add sMVK treasury asset if has
      .concat(sMVKAmount ?? [])
      // Sort by most balance to top
      .sort((asset1, asset2) => asset2.balance * Number(asset2.rate) - asset1.balance * Number(asset1.rate))

    const treasuryTVL = treasuryNormalizedTokens.reduce<number>((acc, { usdValue }) => (acc += usdValue), 0)

    return {
      address: treasuryData.address,
      name:
        treasuryData.name ??
        `Treasury ${treasuryData.address.slice(0, 7)}...${treasuryData.address.slice(
          treasuryData.address.length - 4,
          treasuryData.address.length,
        )}`,
      balances: treasuryNormalizedTokens,
      treasuryTVL,
    }
  })

  const tokenBalanceMapper = mappedTreasuries
    .map(({ balances }) => balances)
    .flat()
    .reduce<Record<string, { balance: number; name: string; tokenAddress: string }>>(
      (acc, { name, balance, tokenAddress }) => {
        if (!acc[tokenAddress]) {
          acc[tokenAddress] = {
            balance,
            name,
            tokenAddress,
          }
        } else {
          acc[tokenAddress] = {
            ...acc[tokenAddress],
            balance: acc[tokenAddress].balance + balance,
          }
        }

        return acc
      },
      {},
    )

  return {
    tokenBalanceMapper,
    mappedTreasuries,
  }
}
