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
import { VaultsList } from 'pages/Loans/Components/LoansComponents.style'

// helpers
import {
  VAULTS_LIST_NAME,
  getPageNumber,
  MY_VAULTS_LIST_NAME,
  PERMISSIONED_VAULTS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { calculateSlicePositions } from 'app/App.components/Pagination/pagination.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getVaultAssets } from './Vaults.helpers'

// types
import { State } from '../../reducers'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

// actions
import { markForLiquidation } from './Vaults.actions'
import { getLoansStorage } from 'pages/Loans/Actions/getLoansData.actions'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

const pathname = '/vaults'

export const vaultTabs = {
  ALL: 'all',
  MY: 'my',
  PERMISSIONED: 'permissioned',
}

export const VaultsView = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search } = useLocation()

  const { tokensMetadata } = useTokensContext()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    vaults: { permissinedVaultsIds, myVaultsIds, allVaultsIds, vaultsMapper },
    isDataLoaded,
  } = useSelector((state: State) => state.loans)
  const { tabId } = useParams<{ tabId: string }>()

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isDataLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )
  const [tabsList, setTabsList] = useState<TabItem[]>([])
  const [vaultsIds, setVaultsIds] = useState<string[]>([])
  const assets = useMemo(() => getVaultAssets(vaultsMapper, tokensMetadata), [vaultsMapper, tokensMetadata])

  const currentListName =
    tabId === vaultTabs.ALL
      ? VAULTS_LIST_NAME
      : tabId === vaultTabs.MY
      ? MY_VAULTS_LIST_NAME
      : PERMISSIONED_VAULTS_LIST_NAME

  const currentVaultsIds =
    tabId === vaultTabs.ALL ? allVaultsIds : tabId === vaultTabs.MY ? myVaultsIds : permissinedVaultsIds

  const currentPage = getPageNumber(search, currentListName)

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    const currentTabId = tabsList.find((item) => item.path === tabId)?.id

    if (!foundTab?.path || currentTabId === id) return

    history.replace(`${pathname}/${foundTab.path}`)
    setVaultsIds(foundTab.path === vaultTabs.ALL ? allVaultsIds : myVaultsIds)
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return vaultsIds?.slice(from, to)
  }, [currentListName, currentPage, vaultsIds])

  const handleMarkForLiquidation = async (vaultId: number, vaultOwner: string) => {
    await dispatch(markForLiquidation(vaultId, vaultOwner))
  }

  // switch to "all" tab if user is disabled and set tabs
  useEffect(() => {
    const baseTabs = [
      {
        text: 'All Vaults',
        id: 1,
        active: vaultTabs.ALL === tabId,
        path: vaultTabs.ALL,
      },
    ]

    const tabsToUse = accountPkh
      ? [
          ...baseTabs,
          {
            text: 'My Vaults',
            id: 2,
            active: vaultTabs.MY === tabId,
            path: vaultTabs.MY,
          },
          {
            text: 'Permissioned Vaults',
            id: 3,
            active: vaultTabs.PERMISSIONED === tabId,
            path: vaultTabs.PERMISSIONED,
            isDisabled: !accountPkh,
          },
        ]
      : baseTabs

    setTabsList(tabsToUse)

    if (accountPkh) return
    // return back to "all vaults" tab if user is not connected
    history.replace(`${pathname}/${baseTabs[0].path}`)
  }, [accountPkh, tabId])

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
        <VaultsList>
          {paginatedVaultsList.map((item) => {
            const isOwner = vaultsMapper[item]?.ownerId === accountPkh

            return (
              <VaultsCard
                key={item}
                isOwner={isOwner}
                handleMarkForLiquidation={handleMarkForLiquidation}
                vaultTab={tabId}
                {...vaultsMapper[item]}
              />
            )
          })}

          <Pagination itemsCount={vaultsIds.length} listName={currentListName} />
        </VaultsList>
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No financial requests to show" />
          <figcaption>No Vaults to show</figcaption>
        </EmptyContainer>
      )}
    </VaultsStyled>
  )
}
