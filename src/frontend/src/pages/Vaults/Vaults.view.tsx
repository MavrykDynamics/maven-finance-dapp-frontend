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

// types
import { State } from '../../reducers'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'

// actions
import { getVaultsStorage, liquidateVault, markForLiquidation } from './Vaults.actions'

const pathname = '/vaults'

const tabsId = {
  ALL: 'all',
  MY: 'my'
}

const tabsList: TabItem[] = [
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
    path: tabsId.MY
  },
]

export const VaultsStatuses = {
  LIQUIDATABLE: 'LIQUIDATABLE',
  GRACE_PERIOD: 'GRACE PERIOD',
  MARK: 'MARK',
  AT_RISK: 'AT RISK',
  ACTIVE: 'ACTIVE',
}

const ListOfStatuses = Object.values(VaultsStatuses)

export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList } = useSelector((state: State) => state.vaults)
  const { tabId } = useParams<{ tabId: string }>()

  // TODO: deleted ts-ignores
  // @ts-ignore
  const myVaultsIds = vaultsList?.myVaultsIds as string[]
  // @ts-ignore
  const allVaultsIds = vaultsList?.allVaultsIds as string[]
  // @ts-ignore
  const vaultsMapper = vaultsList?.vaultsMapper as Record<string, VaultType>

    const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([dispatch(getVaultsStorage())])
    } catch (e) {
      //TODO: handle fetch error
    }
  }, [])

  const [filteredData, setFilteredData] = useState<string[]>([])

  const currentListName = tabId === tabsId.ALL ? VAULTS_LIST_NAME : MY_VAULTS_LIST_NAME

  const currentPage = getPageNumber(
    search,
    currentListName
  )

  // TODO: handle my vaults tab if user disconnect
  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    history.replace(`${pathname}/${foundTab?.path}`)
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return filteredData?.slice(from, to)
  }, [currentListName, currentPage, filteredData])

  const handleLiquidateVault = (vaultId: string, vaultOwner: string, liquidateAmount: number) => {
    dispatch(liquidateVault(vaultId, vaultOwner, liquidateAmount))
  }

  const handleMarkForLiquidation = (vaultId: string, vaultOwner: string) => {
    dispatch(markForLiquidation(vaultId, vaultOwner))
  }

  useEffect(() => {
    setFilteredData(
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

      <VaultsSearchFilter statuses={ListOfStatuses} />

      {paginatedVaultsList.map((item) => {
        const isOwner = vaultsMapper[item].ownerId === accountPkh
        
        return (
          <VaultsCard
            key={item}
            isOwner={isOwner}
            {...vaultsMapper[item]}
          />
      )})}

      <Pagination
        itemsCount={filteredData.length}
        listName={currentListName}
      />
    </VaultsStyled>
  )
}
