import { useState, useMemo, useEffect, useLayoutEffect, useDeferredValue, ChangeEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// components
import { VaultsSearchFilter } from './components/VaultsSearchFilter.view'
import { VaultsCard } from './components/VaultsCard.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
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
  getTotalPages,
} from 'app/App.components/Pagination/pagination.consts'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

// actions
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  PAGINATION_ALL,
  PAGINATION_MY,
  PAGINATION_PERMISSIONED,
  VAULTS_ALL,
  VAULTS_DATA,
  VAULTS_LIMIT,
  VAULTS_USER_ALL,
  VAULTS_USER_DEPOSITOR,
} from 'providers/VaultsProvider/vaults.provider.consts'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { MARK_FOR_LIQUIDATION_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { markForLiquidation } from 'providers/VaultsProvider/actions/vaultsLiquidation.actions'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

const pathname = '/vaults'

export const vaultTabs = {
  ALL: 'all',
  MY: 'my',
  PERMISSIONED: 'permissioned',
}

export const VaultsView = () => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { tabId = 'all' } = useParams<{ tabId: string }>()

  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()
  const { changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()
  const {
    changeVaultsSubscriptionsList,
    isLoading: isVaultsLoading,
    myVaultsIds,
    allVaultsIds,
    vaultsMapper,
    myVaultsMapper,
    permissionedVaultsMapper,
    permissionedVaultsIds,
    vaultsPaginationStats: { total: totalVaultsCount, my: myVaultsCount, permissioned: permissionedVaultsCount },
    setIsLoading,
    changePage,
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
  }, [allVaultsIds, isVaultsLoading, myVaultsIds, permissionedVaultsIds, tabId])

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
    [tabId],
  )
  const [vaultsIds, setVaultsIds] = useState<string[]>([])

  const { currentMapper, currentListName, currentVaultsCount, currentVaultsIds } = useMemo(() => {
    if (tabId === vaultTabs.MY) {
      return {
        currentMapper: myVaultsMapper,
        currentListName: MY_VAULTS_LIST_NAME,
        currentVaultsCount: myVaultsCount,
        currentVaultsIds: myVaultsIds,
      }
    }
    if (tabId === vaultTabs.PERMISSIONED) {
      return {
        currentMapper: permissionedVaultsMapper,
        currentListName: PERMISSIONED_VAULTS_LIST_NAME,
        currentVaultsCount: permissionedVaultsCount,
        currentVaultsIds: permissionedVaultsIds,
      }
    }

    return {
      currentMapper: vaultsMapper,
      currentListName: VAULTS_LIST_NAME,
      currentVaultsCount: totalVaultsCount,
      currentVaultsIds: allVaultsIds,
    }
  }, [
    allVaultsIds,
    myVaultsCount,
    myVaultsIds,
    myVaultsMapper,
    permissionedVaultsCount,
    permissionedVaultsIds,
    permissionedVaultsMapper,
    tabId,
    totalVaultsCount,
    vaultsMapper,
  ])

  const currentPage = useMemo(() => getPageNumber(search, currentListName), [search, currentListName])

  useEffect(() => {
    if (tabId === vaultTabs.ALL) changePage(currentPage, PAGINATION_ALL)
    if (tabId === vaultTabs.MY) changePage(currentPage, PAGINATION_MY)
    if (tabId === vaultTabs.PERMISSIONED) changePage(currentPage, PAGINATION_PERMISSIONED)
  }, [currentPage])

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    const currentTabId = tabsList.find((item) => item.path === tabId)?.id

    if (!foundTab?.path || currentTabId === id) return

    setIsLoading(true)

    navigate(`${pathname}/${foundTab.path}`)
    setVaultsIds(
      foundTab.path === vaultTabs.ALL
        ? allVaultsIds
        : foundTab.path === vaultTabs.MY
        ? myVaultsIds
        : permissionedVaultsIds,
    )
  }

  const contractActionProps: HookContractActionArgs<{ vaultId: number; vaultOwner: string }> = useMemo(
    () => ({
      actionType: MARK_FOR_LIQUIDATION_ACTION,
      actionFn: async ({ vaultId, vaultOwner }: { vaultId: number; vaultOwner: string }) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!lendingControllerAddress) {
          bug('Wrong lending address')
          return null
        }

        return await markForLiquidation(vaultId, vaultOwner, lendingControllerAddress)
      },
    }),
    [lendingControllerAddress, userAddress],
  )

  const { actionWithArgs: handleMarkForLiquidation } = useContractAction(contractActionProps)

  const totalPages = useMemo(() => getTotalPages(currentVaultsCount, VAULTS_LIMIT), [currentVaultsCount])

  return (
    <VaultsStyled>
      <SlidingTabButtons
        kind={SECONDARY_SLIDING_TAB_BUTTONS}
        tabItems={tabsList}
        onClick={handleChangeTabs}
        className="mt-30 mb-30"
      />

      <VaultsSearchFilter
        vaultsMapper={currentMapper}
        currentVaultsIds={currentVaultsIds}
        allVaultsIds={allVaultsIds}
        setVaultsIds={setVaultsIds}
      />

      {isLoansLoading || isVaultsLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : vaultsIds.length ? (
        <VaultsList>
          {currentVaultsIds.map((item) => {
            const isOwner = currentMapper[item]?.ownerAddress === userAddress

            return (
              <VaultsCard
                vault={currentMapper[item]}
                key={item}
                isOwner={isOwner}
                handleMarkForLiquidation={handleMarkForLiquidation}
                vaultTab={tabId}
              />
            )
          })}

          <Pagination itemsCount={totalPages} listName={currentListName} />
        </VaultsList>
      ) : (
        <EmptyContainer className="centered">
          <img src="/images/not-found.svg" alt=" No vaults to show" />
          <figcaption>No Vaults to show</figcaption>
        </EmptyContainer>
      )}
    </VaultsStyled>
  )
}
