import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import QueryString from 'qs'
import { useLocation } from 'react-router'

import { DashboardView } from './Dashboard.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

// providers
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

// const & types
import { DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_DATA_SUB } from 'providers/TreasuryProvider/helpers/treasury.consts'
import { mvkStatsType, isValidPersonalDashboardTabId, LENDING_TAB_ID } from './Dashboard.utils'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'
import {
  MVK_SMVK_HISTORY_SUB,
  DEFAULT_STAKING_ACTIVE_SUBS,
  DAPP_MVK_SMVK_STATS_SUB,
} from 'providers/DoormanProvider/helpers/doorman.consts'
import {
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITES_DATA_ACTIVE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'
import { State } from '../../reducers'

// hooks
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// actions
import { getFarmStorage } from 'pages/Farms/Farms.actions'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useVestingContext } from 'providers/VestingProvider/vesting.provider'
import { DEFAULT_VESTING_SUBS, VESTING_STORAGE_DATA_SUB } from 'providers/VestingProvider/helpers/vesting.consts'

// TODO: add farms when their data loading will be fixed and up
export const Dashboard = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { tab: string }
  const activeTab = isValidPersonalDashboardTabId(parsedQp.tab) ? parsedQp.tab : LENDING_TAB_ID

  const {
    totalStakedMvk,
    totalSupply,
    maximumTotalSupply,
    isLoading: isDoormanLoading,
    changeStakingSubscriptionsList,
  } = useDoormanContext()
  const { isLoading: isSatellitesLoading, changeSatellitesSubscriptionsList } = useSatellitesContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { marketsAddresses, marketsMapper, changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()
  const { vaultsMapper, allVaultsIds, isLoading: isVaultsLoading, changeVaultsSubscriptionsList } = useVaultsContext()

  useEffect(() => {
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
      [MVK_SMVK_HISTORY_SUB]: true,
    })

    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ACTIVE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_ALL,
    })

    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_DATA_SUB]: true,
    })

    changeVestingSubscriptionsList({
      [VESTING_STORAGE_DATA_SUB]: true,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
      changeVestingSubscriptionsList(DEFAULT_VESTING_SUBS)
    }
  }, [])

  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0

  const {
    treasuryMapper,
    treasuryAddresses,
    isLoading: isTreasuryLoading,
    changeTreasurySubscriptionsList,
  } = useTreasuryContext()

  const { isLoading: isVestingLoading, changeVestingSubscriptionsList } = useVestingContext()
  // const { farms, isLoaded: isFarmsLoaded } = useSelector((state: State) => state.farm)

  const { totalBorrowed, totalLended } = useMemo(
    () =>
      marketsAddresses.reduce<{
        totalLended: number
        totalBorrowed: number
      }>(
        (acc, marketTokenAddress) => {
          const market = marketsMapper[marketTokenAddress]
          const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })

          if (!token || !token.rate || !market) return acc

          const { totalBorrowed, totalLended } = market
          const { decimals, rate } = token

          acc.totalBorrowed += convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
          acc.totalLended += convertNumberForClient({ number: totalLended, grade: decimals }) * rate
          return acc
        },
        {
          totalLended: 0,
          totalBorrowed: 0,
        },
      ),
    [marketsAddresses, marketsMapper, tokensMetadata, tokensPrices],
  )

  const marketCapValue = mvkExchangeRate ? mvkExchangeRate * totalSupply : 0

  const treasuryTVL = useMemo(
    () =>
      treasuryAddresses.reduce((acc, address) => {
        const { balances } = treasuryMapper[address]
        return (acc += balances.reduce((balanceAcc, { tokenAddress, balance }) => {
          const { rate, decimals } = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices }) ?? {}
          return rate ? balanceAcc + convertNumberForClient({ number: balance, grade: decimals }) * rate : balanceAcc
        }, 0))
      }, 0),
    [tokensMetadata, tokensPrices, treasuryAddresses, treasuryMapper],
  )

  const vaultsTvl = useMemo(
    () =>
      allVaultsIds.reduce((acc, vaultId) => {
        const { collateralData } = vaultsMapper[vaultId]

        return (acc += collateralData.reduce((collateralAcc, { amount, tokenAddress }) => {
          const { rate, decimals } = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices }) ?? {}
          return rate ? collateralAcc + convertNumberForClient({ number: amount, grade: decimals }) * rate : 0
        }, 0))
      }, 0),
    [allVaultsIds, tokensMetadata, tokensPrices, vaultsMapper],
  )

  // TODO: check this calculation with sam
  const farmsTVL = 0
  // farms.reduce((acc, farm) => {
  //   return (acc += farm.lpBalance)
  // }, 0)

  const lendingTvl = totalBorrowed + totalLended
  const doormanTVL = totalStakedMvk * mvkExchangeRate

  const tvlValue = doormanTVL + treasuryTVL + farmsTVL + lendingTvl + vaultsTvl

  const { isLoading: isPromiseLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          // (!isFarmsLoaded || isDepsChanged) && dispatch(getFarmStorage(tokensMetadata)),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  const mvkStatsBlock: mvkStatsType = {
    marketCap: marketCapValue,
    stakedMvk: totalStakedMvk,
    circuatingSupply: totalSupply,
    maxSupply: maximumTotalSupply,
    livePrice: mvkExchangeRate,
    // TODO: remove when mvk rate will be dynamic
    prevPrice: mvkExchangeRate - 0.00999,
  }

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView
        tvl={tvlValue}
        mvkStatsBlock={mvkStatsBlock}
        activeTab={activeTab}
        isLoading={
          isPromiseLoading ||
          isDoormanLoading ||
          isSatellitesLoading ||
          isLoansLoading ||
          isVaultsLoading ||
          isTreasuryLoading ||
          isVestingLoading
        }
      />
    </Page>
  )
}
