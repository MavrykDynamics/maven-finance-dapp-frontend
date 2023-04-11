import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'

import { DashboardView } from './Dashboard.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Page } from 'styles'

import { State } from '../../reducers'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { mvkStatsType, isValidPersonalDashboardTabId, LENDING_TAB_ID } from './Dashboard.utils'
import { fillTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { mvk: mvkExchangeRate = 0 },
  } = useSelector((state: State) => state.tokens)
  const {
    totalStakedMvk,
    totalSupply,
    maximumTotalSupply,
    isLoaded: isDoormanLoaded,
  } = useSelector((state: State) => state.doorman)
  const { treasuryStorage, isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const { isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isLoaded: isGovernanceLoaded } = useSelector((state: State) => state.governance)
  const {
    vaultsList: { allVaultsIds, vaultsMapper },
    isLoaded: isVaultsLoaded,
  } = useSelector((state: State) => state.vaults)
  const { farms, isLoaded: isFarmsLoaded } = useSelector((state: State) => state.farm)
  const { isDataLoaded: isLoansLoaded, loanTokens } = useSelector((state: State) => state.loans)

  const { totalBorrowed, totalLended } = loanTokens.reduce<{
    totalLended: number
    totalBorrowed: number
  }>(
    (acc, { totalBorrowed, totalLended, loanTokenData: { rate } }) => {
      acc.totalBorrowed += totalBorrowed * rate
      acc.totalLended += totalLended * rate
      return acc
    },
    {
      totalLended: 0,
      totalBorrowed: 0,
    },
  )

  const marketCapValue = mvkExchangeRate ? mvkExchangeRate * totalSupply : 0

  const treasuryTVL = treasuryStorage.reduce((acc, { balances }) => {
    return (acc += balances.reduce((balanceAcc, balanceAsset) => {
      return (balanceAcc += balanceAsset.usdValue || 0)
    }, 0))
  }, 0)

  const vaultsTvl = allVaultsIds.reduce<number>((acc, vaultId) => {
    const { collateralData } = vaultsMapper[vaultId]

    return (acc += collateralData.reduce<number>(
      (collateralAcc, { amount, rate }, idx) =>
        (collateralAcc += idx !== collateralData.length - 1 ? amount * rate : 0),
      0,
    ))
  }, 0)

  // TODO: check this calculation with sam
  const farmsTVL = farms.reduce((acc, farm) => {
    return (acc += farm.lpBalance)
  }, 0)

  const lendingTvl = totalBorrowed + totalLended
  const doormanTVL = totalStakedMvk * mvkExchangeRate

  const tvlValue = doormanTVL + treasuryTVL + farmsTVL + lendingTvl + vaultsTvl

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isGovernanceLoaded || isDepsChanged) && dispatch(getGovernanceStorage()),
          (!isVaultsLoaded || isDepsChanged) && dispatch(getVaultsStorage()),
          (!isVestingLoaded || isDepsChanged) && dispatch(getVestingStorage()),
          (!isTreasuryLoaded || isDepsChanged) && dispatch(fillTreasuryStorage()),
          (!isLoansLoaded || isDepsChanged) && dispatch(getLoansStorage()),
          (!isFarmsLoaded || isDepsChanged) && dispatch(getFarmStorage()),
          (!isDoormanLoaded || isDepsChanged) && dispatch(getDoormanStorage()),
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
    prevPrice: mvkExchangeRate - 0.1,
  }

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView
        tvl={tvlValue}
        mvkStatsBlock={mvkStatsBlock}
        activeTab={isValidPersonalDashboardTabId(tabId) ? tabId : LENDING_TAB_ID}
        isLoading={isLoading}
      />
    </Page>
  )
}
