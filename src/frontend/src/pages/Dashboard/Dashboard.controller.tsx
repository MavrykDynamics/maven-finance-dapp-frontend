import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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

// const & types
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

// actions
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

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

  console.log({ vaultsMapper })

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

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
    }
  }, [])

  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0

  const { treasuryStorage, isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  // const { farms, isLoaded: isFarmsLoaded } = useSelector((state: State) => state.farm)

  const { totalBorrowed, totalLended } = marketsAddresses.reduce<{
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
  )

  const marketCapValue = mvkExchangeRate ? mvkExchangeRate * totalSupply : 0

  const treasuryTVL = treasuryStorage.reduce((acc, { balances }) => {
    return (acc += balances.reduce((balanceAcc, { tokenAddress, balance }) => {
      const { rate, decimals } = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices }) ?? {}
      return rate ? balanceAcc + convertNumberForClient({ number: balance, grade: decimals }) * rate : balanceAcc
    }, 0))
  }, 0)

  const vaultsTvl = allVaultsIds.reduce((acc, vaultId) => {
    const { collateralData } = vaultsMapper[vaultId]

    return (acc += collateralData.reduce((collateralAcc, { amount, tokenAddress }) => {
      const { rate, decimals } = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices }) ?? {}
      return rate ? collateralAcc + convertNumberForClient({ number: amount.toNumber(), grade: decimals }) * rate : 0
    }, 0))
  }, 0)

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
          (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
          (!isVestingLoaded || isDepsChanged) && dispatch(getVestingStorage()),
          (!isTreasuryLoaded || isDepsChanged) && dispatch(getTreasuryStorage()),
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
        isLoading={isPromiseLoading || isDoormanLoading || isSatellitesLoading || isLoansLoading || isVaultsLoading}
      />
    </Page>
  )
}
