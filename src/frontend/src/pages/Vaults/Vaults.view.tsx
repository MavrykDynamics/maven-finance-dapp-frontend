import { useState, useMemo, useEffect, useLayoutEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation, useHistory, useParams } from 'react-router'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'

// styles
import { VaultsStyled } from './Vaults.style'
import { VaultsList } from 'pages/Loans/Components/LoansComponents.style'

// helpers
import {
  LOANS_CONFIG,
  DEFAULT_LOANS_ACTIVE_SUBS,
  LOANS_MARKETS_DATA,
} from 'providers/LoansProvider/helpers/loans.const'
import {
  VAULTS_LIST_NAME,
  getPageNumber,
  MY_VAULTS_LIST_NAME,
  PERMISSIONED_VAULTS_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { calculateSlicePositions } from 'app/App.components/Pagination/pagination.consts'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

// actions
import { markForLiquidation } from './Vaults.actions'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  VAULTS_ALL,
  VAULTS_DATA,
  VAULTS_USER_ALL,
  VAULTS_USER_DEPOSITOR,
} from 'providers/VaultsProvider/vaults.provider.consts'

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
  const { tabId } = useParams<{ tabId: string }>()

  const { userAddress } = useUserContext()
  const { changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()
  const {
    changeVaultsSubscriptionsList,
    isLoading: isVaultsLoading,
    myVaultsIds,
    allVaultsIds,
    vaultsMapper,
    permissionedVaultsIds,
  } = useVaultsContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_CONFIG]: true,
      [LOANS_MARKETS_DATA]: true,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
    }
  }, [])

  useEffect(() => {
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]:
        tabId === vaultTabs.ALL ? VAULTS_ALL : tabId === vaultTabs.MY ? VAULTS_USER_ALL : VAULTS_USER_DEPOSITOR,
    })
  }, [tabId])

  useLayoutEffect(() => {
    if (!isVaultsLoading)
      setVaultsIds(
        tabId === vaultTabs.ALL ? allVaultsIds : tabId === vaultTabs.MY ? myVaultsIds : permissionedVaultsIds,
      )
  }, [isVaultsLoading])

  useEffect(() => {
    if (!userAddress && (tabId === vaultTabs.MY || tabId === vaultTabs.PERMISSIONED)) {
      setVaultsIds([])
    }
  }, [userAddress])

  const tabsList = useMemo(
    () => [
      {
        text: 'All Vaults',
        id: 1,
        active: vaultTabs.ALL === tabId,
        path: vaultTabs.ALL,
      },
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
      },
    ],
    [tabId, userAddress],
  )
  const [vaultsIds, setVaultsIds] = useState<string[]>([])

  const currentListName =
    tabId === vaultTabs.ALL
      ? VAULTS_LIST_NAME
      : tabId === vaultTabs.MY
      ? MY_VAULTS_LIST_NAME
      : PERMISSIONED_VAULTS_LIST_NAME

  const currentVaultsIds = useMemo(
    () => (tabId === vaultTabs.ALL ? allVaultsIds : tabId === vaultTabs.MY ? myVaultsIds : permissionedVaultsIds),
    [allVaultsIds, myVaultsIds, permissionedVaultsIds, tabId],
  )

  const currentPage = getPageNumber(search, currentListName)

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    const currentTabId = tabsList.find((item) => item.path === tabId)?.id

    if (!foundTab?.path || currentTabId === id) return

    history.replace(`${pathname}/${foundTab.path}`)
    setVaultsIds(
      foundTab.path === vaultTabs.ALL
        ? allVaultsIds
        : foundTab.path === vaultTabs.MY
        ? myVaultsIds
        : permissionedVaultsIds,
    )
  }

  const paginatedVaultsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return vaultsIds?.slice(from, to)
  }, [currentListName, currentPage, vaultsIds])

  const handleMarkForLiquidation = async (vaultId: number, vaultOwner: string) => {
    await dispatch(markForLiquidation(vaultId, vaultOwner))
  }

  return (
    <VaultsStyled>
      <SlidingTabButtons
        kind={SECONDARY_SLIDING_TAB_BUTTONS}
        tabItems={tabsList}
        onClick={handleChangeTabs}
        className="mt-30 mb-30"
      />

      <VaultsSearchFilter
        vaultsMapper={vaultsMapper}
        currentVaultsIds={currentVaultsIds}
        allVaultsIds={allVaultsIds}
        setVaultsIds={setVaultsIds}
      />

      {isLoansLoading || isVaultsLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : paginatedVaultsList.length ? (
        <VaultsList>
          {paginatedVaultsList.map((item) => {
            const isOwner = vaultsMapper[item]?.ownerAddress === userAddress

            return (
              <VaultsCard
                vault={vaultsMapper[item]}
                key={item}
                isOwner={isOwner}
                handleMarkForLiquidation={handleMarkForLiquidation}
                vaultTab={tabId}
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
