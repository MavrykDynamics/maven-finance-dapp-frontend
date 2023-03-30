import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useHistory, useParams } from 'react-router'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import { TabSwitcher } from 'pages/Council/Council.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'

// styles
import { VaultsStyled } from './Vaults.style'

// helpers
import { VAULTS_LIST_NAME, getPageNumber, MY_VAULTS_LIST_NAME } from 'app/App.components/Pagination/pagination.consts'
import { calculateSlicePositions } from 'app/App.components/Pagination/pagination.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getVaultAssets } from './Vaults.helpers'

// types
import { State } from '../../reducers'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { getVaultsStorage, markForLiquidation } from './Vaults.actions'
import { getAvaliableCollaterals } from 'pages/Loans/Actions/getLoansData.actions'

const pathname = '/vaults'

const tabsId = {
  ALL: 'all',
  MY: 'my',
}

export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    vaultsList: { myVaultsIds, allVaultsIds, vaultsMapper },
    isLoaded,
  } = useSelector((state: State) => state.vaults)
  const { tabId } = useParams<{ tabId: string }>()

  const tabsList: TabItem[] = useMemo(
    () => [
      {
        text: 'All Vaults',
        id: 1,
        active: tabsId.ALL === tabId,
        path: tabsId.ALL,
      },
      {
        text: 'My Vaults',
        id: 2,
        active: tabsId.MY === tabId,
        path: tabsId.MY,
        isDisabled: !accountPkh,
      },
    ],
    [accountPkh, tabId],
  )

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        await Promise.all(
          [(!isLoaded || isDepsChanged) && dispatch(getVaultsStorage()), dispatch(getAvaliableCollaterals())].filter(
            Boolean,
          ),
        )
      } catch (e) {}
    },
    [accountPkh],
  )

  const [vaultsIds, setVaultsIds] = useState<string[]>([])
  const assets = useMemo(() => getVaultAssets(vaultsMapper), [vaultsMapper])

  const currentListName = tabId === tabsId.ALL ? VAULTS_LIST_NAME : MY_VAULTS_LIST_NAME
  const currentVaultsIds = tabId === tabsId.ALL ? allVaultsIds : myVaultsIds
  const currentPage = getPageNumber(search, currentListName)

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    const currentTabId = tabsList.find((item) => item.path === tabId)?.id

    if (!foundTab?.path || currentTabId === id) return

    history.replace(`${pathname}/${foundTab.path}`)
    setVaultsIds(foundTab.path === tabsId.ALL ? allVaultsIds : myVaultsIds)
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return vaultsIds?.slice(from, to)
  }, [currentListName, currentPage, vaultsIds])

  const handleMarkForLiquidation = (vaultId: number, vaultOwner: string) => {
    dispatch(markForLiquidation(vaultId, vaultOwner))
  }

  // switch to "all" tab if user is disabled
  useEffect(() => {
    if (accountPkh) return
    handleChangeTabs(tabsList[0].id)
  }, [accountPkh])

  return (
    <VaultsStyled>
      <TabSwitcher tabItems={tabsList} onClick={handleChangeTabs} className="tabSwitcher" />

      <VaultsSearchFilter
        assets={assets}
        vaultsMapper={vaultsMapper}
        currentVaultsIds={currentVaultsIds}
        setVaultsIds={setVaultsIds}
      />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : paginatedVaultsList.length ? (
        <div className="vaults">
          {paginatedVaultsList.map((item) => {
            const isOwner = vaultsMapper[item]?.ownerId === accountPkh

            return (
              <VaultsCard
                key={item}
                isOwner={isOwner}
                handleMarkForLiquidation={handleMarkForLiquidation}
                {...vaultsMapper[item]}
              />
            )
          })}

          <Pagination itemsCount={vaultsIds.length} listName={currentListName} />
        </div>
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No Vaults to show</figcaption>
        </EmptyContainer>
      )}
    </VaultsStyled>
  )
}
