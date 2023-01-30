import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory, useParams } from 'react-router'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import { TabSwitcher } from 'pages/Council/Council.style'
import { Pagination } from 'pages/BreakGlass/BreakGlass.style'

// styles
import { VaultsStyled } from './Vaults.style'

// helpers
import { VAULTS_LIST_NAME, MY_VAULTS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getVaultAssets } from './Vaults.helpers'

// types
import { State } from '../../reducers'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { getVaultsStorage, liquidateVault, markForLiquidation } from './Vaults.actions'
import { getLoansStorage } from 'pages/Loans/Loans.actions'

const pathname = '/vaults'

const tabsId = {
  ALL: 'all',
  MY: 'my'
}

export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList: { myVaultsIds, allVaultsIds, vaultsMapper } } = useSelector((state: State) => state.vaults)
  const { tabId } = useParams<{ tabId: string }>()

  const tabsList: TabItem[] = useMemo(() => ([
    {
      text: 'All Vaults',
      id: 1,
      active: true,
      path: tabsId.ALL
    },
    {
      text: 'My Vaults',
      id: 2,
      active: false,
      path: tabsId.MY,
      isDisabled: !accountPkh
    },
  ]), [accountPkh])

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getVaultsStorage())
    } catch (e) {
      //TODO: handle fetch error
    }
  }, [accountPkh])

  const [vaultsIds, setVaultsIds] = useState<string[]>([])
  const assets = useMemo(() => getVaultAssets(vaultsMapper), [vaultsMapper])

  const currentListName = tabId === tabsId.ALL ? VAULTS_LIST_NAME : MY_VAULTS_LIST_NAME

  const currentPage = getPageNumber(
    search,
    currentListName
  )

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    if (!foundTab?.path) return 

    history.replace(`${pathname}/${foundTab.path}`)
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return vaultsIds?.slice(from, to)
  }, [currentListName, currentPage, vaultsIds])

  const handleLiquidateVault = (vaultId: number, vaultOwner: string, liquidateAmount: number) => {
    dispatch(liquidateVault(vaultId, vaultOwner, liquidateAmount))
  }

  const handleMarkForLiquidation = (vaultId: number, vaultOwner: string) => {
    dispatch(markForLiquidation(vaultId, vaultOwner))
  }

  useEffect(() => {
    setVaultsIds(
      tabId === tabsId.ALL
      ? allVaultsIds
      : myVaultsIds
    )
  }, [allVaultsIds, myVaultsIds, tabId])

  return (
    <VaultsStyled>
      <TabSwitcher
        tabItems={tabsList}
        onClick={handleChangeTabs}
        className="tabSwitcher"
      />

      <VaultsSearchFilter
        assets={assets}
        vaultsMapper={vaultsMapper}
        allVaultsIds={allVaultsIds}
        setVaultsIds={setVaultsIds}
      />

      {paginatedVaultsList.map((item) => {
        const isOwner = vaultsMapper[item].ownerId === accountPkh
        
        return (
          <VaultsCard
            key={item}
            isOwner={isOwner}
            handleLiquidateVault={handleLiquidateVault}
            handleMarkForLiquidation={handleMarkForLiquidation}
            {...vaultsMapper[item]}
          />
      )})}

      <Pagination
        itemsCount={vaultsIds.length}
        listName={currentListName}
      />
    </VaultsStyled>
  )
}
