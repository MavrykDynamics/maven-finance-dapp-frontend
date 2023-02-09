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
    exchangeRate,
    mvkTokenStorage: { totalSupply, maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)
  const { totalStakedMvk = 0 } = useSelector((state: State) => state.doorman)
  const { treasuryStorage } = useSelector((state: State) => state.treasury)
  const { farmStorage } = useSelector((state: State) => state.farm)
  const { isDataLoaded: isLoansLoaded } = useSelector((state: State) => state.loans)
  const {
    chartsData: { totalBorrowed, totalLended },
  } = useSelector((state: State) => state.loans)

  const marketCapValue = exchangeRate ? exchangeRate * totalSupply : 0
  const treasuryTVL = treasuryStorage.reduce((acc, { balances }) => {
    return (acc += balances.reduce((balanceAcc, balanceAsset) => {
      return (balanceAcc += balanceAsset.usdValue || 0)
    }, 0))
  }, 0)

  // TODO: check this calculation with sam
  const farmsTVL = farmStorage.reduce((acc, farm) => {
    return (acc += farm.lpBalance)
  }, 0)

  const lendingTvl = totalBorrowed + totalLended

  //TODO: add calculation for tvl value (loans, vaults)
  const tvlValue = totalStakedMvk * exchangeRate + treasuryTVL + farmsTVL + lendingTvl

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
      await Promise.all([dispatch(getVestingStorage()), dispatch(fillTreasuryStorage())])
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
      await dispatch(getFarmStorage())
    } catch (e) {}
  }, [])

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([dispatch(getGovernanceStorage()), dispatch(getDoormanStorage())])
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
    livePrice: exchangeRate,
    prevPrice: exchangeRate - 0.1,
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
