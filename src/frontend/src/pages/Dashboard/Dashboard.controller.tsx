import { useDispatch, useSelector } from 'react-redux'
import QueryString from 'qs'
import { useLocation } from 'react-router'

import { DashboardView } from './Dashboard.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

// providers
import { useStakeContext } from 'providers/StakeProvider/stake.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// const & types
import { mvkStatsType, isValidPersonalDashboardTabId, LENDING_TAB_ID } from './Dashboard.utils'
import { MVK_TOKEN_SYMBOL } from 'utils/constants'
import { State } from '../../reducers'

// actions
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()

  const parsedQp = QueryString.parse(search, { ignoreQueryPrefix: true }) as { tab: string }
  const activeTab = isValidPersonalDashboardTabId(parsedQp.tab) ? parsedQp.tab : LENDING_TAB_ID

  const { totalStakedMvk, totalSupply, maximumTotalSupply, isLoading: isDoormanLoading } = useStakeContext()
  const { isLoading: isSatellitesLoading } = useSatellitesContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0

  const { treasuryStorage, isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const { farms, isLoaded: isFarmsLoaded } = useSelector((state: State) => state.farm)
  const {
    isDataLoaded: isLoansLoaded,
    loanTokens,
    vaults: { vaultsMapper, allVaultsIds },
  } = useSelector((state: State) => state.loans)

  const { totalBorrowed, totalLended } = loanTokens.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, { totalBorrowed, totalLended, loanTokenAddress }) => {
      const token = getTokenDataByAddress({ tokenAddress: loanTokenAddress, tokensMetadata, tokensPrices })
      if (!token || !token.rate) return acc

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
      return rate ? collateralAcc + convertNumberForClient({ number: amount, grade: decimals }) * rate : 0
    }, 0))
  }, 0)

  // TODO: check this calculation with sam
  const farmsTVL = farms.reduce((acc, farm) => {
    return (acc += farm.lpBalance)
  }, 0)

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
          (!isLoansLoaded || isDepsChanged) && dispatch(getLoansStorage()),
          (!isFarmsLoaded || isDepsChanged) && dispatch(getFarmStorage(tokensMetadata)),
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
    prevPrice: mvkExchangeRate - 0.1,
  }

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView
        tvl={tvlValue}
        mvkStatsBlock={mvkStatsBlock}
        activeTab={activeTab}
        isLoading={isPromiseLoading || isDoormanLoading || isSatellitesLoading}
      />
    </Page>
  )
}
