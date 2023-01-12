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

// types
import { State } from '../../reducers'
import { VaultGQL } from 'utils/TypesAndInterfaces/Vaults'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { getVaultsStorage } from './Vaults.actions'

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

export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList } = useSelector((state: State) => state.vaults)
  const { tabId } = useParams<{ tabId: string }>()

  const [filteredData, setFilteredData] = useState<VaultGQL[]>([])

  const currentListName = tabId === tabsId.ALL ? VAULTS_LIST_NAME : MY_VAULTS_LIST_NAME

  const currentPage = getPageNumber(
    search,
    currentListName
  )
  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    history.replace(`${pathname}/${foundTab?.path}`)
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return filteredData?.slice(from, to)
  }, [currentListName, currentPage, filteredData])

  useEffect(() => {
    if (vaultsList) {
      setFilteredData(
        tabId === tabsId.ALL
        ? vaultsList
        // TODO: add filtered vaults by accountPkh
        // : vaultsList.filter((item) => item.owner_id === accountPkh)
        : []
      )
    }
  }, [tabId, vaultsList])

  useEffect(() => {
    dispatch(getVaultsStorage())
  }, [dispatch])

  return (
    <VaultsStyled>
      <TabSwitcher
        tabItems={tabsList}
        onClick={handleChangeTabs}
        className="tabSwitcher"
      />

      <VaultsSearchFilter />

      {paginatedVaultsList.map((item, index) => (
        <VaultsCard key={index} address={item.address} />
      ))}

      <Pagination
        itemsCount={filteredData.length}
        listName={currentListName}
      />
    </VaultsStyled>
  )
}
