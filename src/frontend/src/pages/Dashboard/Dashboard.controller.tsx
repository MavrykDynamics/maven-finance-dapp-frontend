import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { fillTreasuryStorage, getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'
import { useParams } from 'react-router'
import { getDelegationStorage } from 'pages/Satellites/Satellites.actions'
import { mvkStatsType, isValidId, LENDING_TAB_ID } from './Dashboard.utils'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { getVaultsStorage } from 'pages/Vaults/Vaults.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getFarmStorage } from 'pages/Farms/Farms.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'

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
  const { isLoaded: isFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
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

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([
        dispatch(getVaultsStorage()),
        dispatch(getDelegationStorage()),
        dispatch(getGovernanceStorage()),
        !isFeedsLoaded && dispatch(getFeedsStorage()),
        !isVestingLoaded && dispatch(getVestingStorage()),
        !isTreasuryLoaded && dispatch(fillTreasuryStorage()),
        !isLoansLoaded && dispatch(getLoansStorage()),
        !isFarmsLoaded && dispatch(getFarmStorage()),
        !isDoormanLoaded && dispatch(getDoormanStorage()),
      ])
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
        activeTab={isValidId(tabId) ? tabId : LENDING_TAB_ID}
        isLoading={isLoading}
      />
    </Page>
  )
}
