import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory } from 'react-router'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import { TabSwitcher } from 'pages/Council/Council.style'
import { Pagination } from 'pages/BreakGlass/BreakGlass.style'

// styles
import { VaultsStyled } from './Vaults.style'

// helpers
import { VAULTS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { State } from '../../reducers'
import { VaultGQL } from 'utils/TypesAndInterfaces/Vaults'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { getVaultsStorage } from './Vaults.actions'

const tabsList: TabItem[] = [
  {
    text: 'All Vaults',
    id: 1,
    active: true,
  },
  {
    text: 'My Vaults',
    id: 2,
    active: false,
  },
]


export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { vaultsList } = useSelector((state: State) => state.vaults)

  const [filteredData, setFilteredData] = useState<VaultGQL[]>([])

  const handleChangeTabs = (tabId?: number) => {
    history.replace(pathname)
  }

  const currentPage = getPageNumber(
    search,
    VAULTS_LIST_NAME
  )

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, VAULTS_LIST_NAME)
    return filteredData?.slice(from, to)
  }, [currentPage, filteredData])

  useEffect(() => {
    if (vaultsList) {
      setFilteredData(vaultsList)
    }
  }, [vaultsList])

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
        listName={VAULTS_LIST_NAME}
      />
    </VaultsStyled>
  )
}
