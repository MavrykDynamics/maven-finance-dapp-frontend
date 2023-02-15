import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { fillTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'
import { useParams } from 'react-router'
import { getDelegationStorage, getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { mvkStatsType, isValidId, LENDING_TAB_ID } from './Dashboard.utils'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'

export const Dashboard = () => {
  const dispatch = useDispatch()
  const { tabId } = useParams<{ tabId: string }>()

  const {
    tokensPrices: { mvk: { usd: mvkExchangeRate = 0 } = {} },
  } = useSelector((state: State) => state.tokens)
  const {
    totalStakedMvk,
    totalSupply,
    maximumTotalSupply,
    isLoaded: isDoormanLoaded,
  } = useSelector((state: State) => state.doorman)
  const { treasuryStorage, isLoaded: isTreasuryLoaded } = useSelector((state: State) => state.treasury)
  const { isLoaded: isVestingLoaded } = useSelector((state: State) => state.vesting)
  const { farms, isLoaded: isFarmsLoaded } = useSelector((state: State) => state.farm)
  const {
    isDataLoaded: isLoansLoaded,
    chartsData: { totalBorrowed, totalLended },
  } = useSelector((state: State) => state.loans)

  const marketCapValue = mvkExchangeRate ? mvkExchangeRate * totalSupply : 0
  const treasuryTVL = treasuryStorage.reduce((acc, { balances }) => {
    return (acc += balances.reduce((balanceAcc, balanceAsset) => {
      return (balanceAcc += balanceAsset.usdValue || 0)
    }, 0))
  }, 0)

  // TODO: check this calculation with sam
  const farmsTVL = farms.reduce((acc, farm) => {
    return (acc += farm.lpBalance)
  }, 0)

  const lendingTvl = totalBorrowed + totalLended
  //TODO: add calculation for tvl value (vaults)
  const tvlValue = totalStakedMvk * mvkExchangeRate + treasuryTVL + farmsTVL + lendingTvl

  const { isLoading: isVaultsLoading } = useDataLoader(async () => {
    try {
      await dispatch(getVaultsStorage())
    } catch (e) {}
  }, [])

  const { isLoading: isOraclesLoading } = useDataLoader(async () => {
    try {
      await dispatch(getOracleStorage())
    } catch (e) {}
  }, [])

  const { isLoading: isDelegationLoading } = useDataLoader(async () => {
    try {
      await dispatch(getDelegationStorage())
    } catch (e) {}
  }, [])

  const { isLoading: isTreasuryLoading } = useDataLoader(async () => {
    try {
      if (!isVestingLoaded) {
        await dispatch(getVestingStorage())
      }

      if (!isTreasuryLoaded) {
        await dispatch(fillTreasuryStorage())
      }
    } catch (e) {}
  }, [])

  const { isLoading: isLendingLoading } = useDataLoader(async () => {
    try {
      if (!isLoansLoaded) {
        await dispatch(getLoansStorage())
      }
    } catch (e) {}
  }, [isLoansLoaded])

  const { isLoading: isFarmsLoading } = useDataLoader(async () => {
    try {
      if (!isFarmsLoaded) {
        await dispatch(getFarmStorage())
      }
    } catch (e) {}
  }, [])

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isDoormanLoaded) {
        await dispatch(getDoormanStorage())
      }
      await dispatch(getGovernanceStorage())
    } catch (e) {}
  }, [])

  const tabLoadings = {
    isVaultsLoading,
    isOraclesLoading,
    isDelegationLoading,
    isTreasuryLoading,
    isLendingLoading,
    isFarmsLoading,
    isLoading,
  }

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
        activeTab={isValidId(tabId) ? tabId : LENDING_TAB_ID}
        tabLoadings={tabLoadings}
      />
    </Page>
  )
}
