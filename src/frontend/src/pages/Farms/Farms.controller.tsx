import { useNavigate, useLocation } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import qs from 'qs'
import classNames from 'classnames'

// provider
import FarmsPopupsProvider from '../../providers/FarmsProvider/farmsPopups.provider'

// types
import {
  isStakedFarmType,
  isLiveFarmType,
  FarmsFiltersStateType,
  FarmsFilterEventType,
} from 'providers/FarmsProvider/helpers/farms.types'

// consts
import {
  DEFAULT_FARMS_ACTIVE_SUBS,
  FARMS_DATA_SUB,
  FARMS_FINISHED_STAKED_DATA_SUB,
  FARMS_ALL_FINISHED_DATA_SUB,
  FARMS_ALL_LIVE_DATA_SUB,
  FARMS_LIVE_STAKED_DATA_SUB,
  LIVE_TAB_ID,
  NO_STAKED,
  STAKED,
} from 'providers/FarmsProvider/helpers/farms.const'
import {
  calculateSlicePositions,
  FARMS_HORIZONTAL_CARDS,
  FARMS_VERTICAL_CARDS,
  PAGINATION_SIDE_CENTER,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'

// hooks
import { useFarmsContext } from 'providers/FarmsProvider/farms.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// utils
import {
  sortFarms,
  filterBySearch,
  getNewOpenedCardsAddresses,
} from 'providers/FarmsProvider/helpers/farmsFilter.utils'

// view
import { EmptyContainer } from 'app/App.style'
import { FarmsStyled } from './Farms.style'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FarmTopBar } from './components/FarmsTopBar/FarmTopBar.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { FarmCard } from './components/FarmCard/FarmCard.controller'

export const Farms = () => {
  const navigate = useNavigate()
  const { search, pathname } = useLocation()
  const { userAddress } = useUserContext()
  const {
    changeFarmsSubscriptionList,
    isLoading: isFarmsLoading,
    farmsMapper,
    allLiveFarms,
    liveStakedFarms,
    allFinishedFarms,
    finishedStakedFarms,
  } = useFarmsContext()

  // Farms filter from top bar
  const farmsFilers: FarmsFiltersStateType = useMemo(() => {
    const {
      openedFarmsCards = [],
      isLive,
      searchValue,
      sortBy,
      isStaked,
    } = qs.parse(search, { ignoreQueryPrefix: true }) as Partial<FarmsFiltersStateType>

    return {
      // user deposited to farms
      isStaked: isStaked !== undefined ? (Number(isStaked) as isStakedFarmType) : NO_STAKED,
      // active farms
      isLive: isLive !== undefined ? (Number(isLive) as isLiveFarmType) : LIVE_TAB_ID,
      // farm token | farm address includes searchValue
      searchValue: searchValue ?? '',
      // list of opened cards
      openedFarmsCards: openedFarmsCards ?? [],
      sortBy: sortBy ?? '',
    }
  }, [search])

  // Farm card view type vertical | horizontal
  const [isVerticalView, setIsVerticalView] = useState(true)
  const listName = isVerticalView ? FARMS_VERTICAL_CARDS : FARMS_HORIZONTAL_CARDS

  // Effect to subscribe to farms based on filter selected
  useEffect(() => {
    const { isLive, isStaked } = farmsFilers

    if (isStaked) {
      changeFarmsSubscriptionList({
        [FARMS_DATA_SUB]: isLive ? FARMS_LIVE_STAKED_DATA_SUB : FARMS_FINISHED_STAKED_DATA_SUB,
      })
    } else {
      changeFarmsSubscriptionList({
        [FARMS_DATA_SUB]: isLive ? FARMS_ALL_LIVE_DATA_SUB : FARMS_ALL_FINISHED_DATA_SUB,
      })
    }

    return () => {
      changeFarmsSubscriptionList(DEFAULT_FARMS_ACTIVE_SUBS)
    }
  }, [farmsFilers])

  // Farms due to selected filters & sorts
  const farmsToUse = useMemo(() => {
    const { isLive, isStaked, searchValue, sortBy } = farmsFilers

    const isLiveFarmsSelected = isLive === LIVE_TAB_ID
    const isStakedFarmsSelected = isStaked === STAKED

    const farmsIds = isStakedFarmsSelected
      ? isLiveFarmsSelected
        ? liveStakedFarms
        : finishedStakedFarms
      : isLiveFarmsSelected
      ? allLiveFarms
      : allFinishedFarms

    if (searchValue !== undefined) {
      return filterBySearch(farmsIds, farmsMapper, searchValue)
    }

    if (sortBy !== undefined) {
      return sortFarms({ farmsIds, farmsMapper, sortBy, userAddress })
    }

    return farmsIds
  }, [farmsFilers, liveStakedFarms, finishedStakedFarms, allLiveFarms, allFinishedFarms, farmsMapper, userAddress])

  // paginate farms
  const paginatedFarms = useMemo(
    () => farmsToUse.slice(...calculateSlicePositions(getPageNumber(search, listName), listName)),
    [farmsToUse, listName, search],
  )

  /**
   * @handleFilterClick fn to handle click on filter as we are storing filters in the qp
   * it will update query params and filtering will perform by query or in @farmsToUse calcs
   */
  const handleFilterClick = useCallback(
    ({
      filterType,
      newStakedValue,
      newLiveFinished,
      newSearchText,
      newSortBy,
      newOpenCardAddress,
    }: FarmsFilterEventType) => {
      // initial filters & sorts to update
      const newFiltersForQP: Partial<FarmsFiltersStateType> = {
        isLive: farmsFilers.isLive,
        ...(farmsFilers.isStaked === STAKED ? { isStaked: farmsFilers.isStaked } : {}),
        ...(farmsFilers.searchValue ? { searchValue: farmsFilers.searchValue } : {}),
        ...(farmsFilers.sortBy ? { sortBy: farmsFilers.sortBy } : {}),
        ...(farmsFilers.openedFarmsCards ? { openedFarmsCards: farmsFilers.openedFarmsCards } : {}),
      }

      // updating live/finished filter
      if (filterType === 'isLive' && newLiveFinished !== undefined) newFiltersForQP.isLive = newLiveFinished
      // updating staked value
      if (filterType === 'isStaked' && newStakedValue !== undefined) newFiltersForQP.isStaked = newStakedValue
      // updating search value
      if (filterType === 'search' && newSearchText !== undefined) newFiltersForQP.searchValue = newSearchText
      // updating sorting
      if (filterType === 'sort' && newSortBy !== undefined) newFiltersForQP.sortBy = newSortBy
      // updated opened cards
      if (filterType === 'openCard' && newOpenCardAddress !== undefined)
        newFiltersForQP.openedFarmsCards = getNewOpenedCardsAddresses(farmsFilers.openedFarmsCards, newOpenCardAddress)

      navigate(`${pathname}${qs.stringify(newFiltersForQP, { addQueryPrefix: true })}`, { replace: true })
    },
    [farmsFilers, pathname],
  )

  return (
    <FarmsPopupsProvider>
      <Page>
        <PageHeader page={'farms'} />

        <FarmTopBar
          handleFilterClick={handleFilterClick}
          farmsFilters={farmsFilers}
          handleSetFarmsViewVariant={setIsVerticalView}
          isVerticalView={isVerticalView}
        />

        <FarmsStyled>
          {isFarmsLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading Farms</div>
            </DataLoaderWrapper>
          ) : farmsToUse.length ? (
            <>
              <section className={classNames({ isVerticalView })}>
                {paginatedFarms.map((farmAddress) => {
                  const farm = farmsMapper[farmAddress]

                  if (!farm) return null

                  const isFarmOpened = Boolean(farmsFilers.openedFarmsCards.find((address) => farm.address === address))
                  const openFarmCallback = () =>
                    handleFilterClick({ filterType: 'openCard', newOpenCardAddress: farm.address })

                  return (
                    <FarmCard
                      farm={farm}
                      key={farm.address}
                      isVertical={isVerticalView}
                      expandCallback={openFarmCallback}
                      isOpenedCard={isFarmOpened}
                    />
                  )
                })}
              </section>
              <Pagination itemsCount={farmsToUse.length} listName={listName} side={PAGINATION_SIDE_CENTER} />
            </>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No farms to show" />
              <figcaption>No farms to show</figcaption>
            </EmptyContainer>
          )}
        </FarmsStyled>
      </Page>
    </FarmsPopupsProvider>
  )
}
