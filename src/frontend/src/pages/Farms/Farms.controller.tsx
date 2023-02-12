import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import qs from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FarmTopBar } from './FarmTopBar/FarmTopBar.controller'
import { FarmCard } from './FarmCard/FarmCard.controller'

// helpers
import {
  getSummDepositedAmount,
  filterByLiveFinished,
  filterBySearch,
  filterByStaked,
  sortFarms,
  getNewOpenedCardsAddresses,
} from './Farms.helpers'

// styles
import { FarmsStyled } from './Farms.style'
import { Page } from 'styles'
import { EmptyContainer as EmptyList } from 'app/App.style'
import { getFarmStorage } from './Farms.actions'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import {
  calculateSlicePositions,
  FARMS_HORIZONTAL_CARDS,
  FARMS_VERTICAL_CARDS,
} from 'pages/FinacialRequests/Pagination/pagination.consts'

// types
import { State } from '../../reducers'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  NO_STAKED,
  LIVE_TAB_ID,
  VERTICAL_FARM_VIEW,
  isStakedFarmType,
  isLiveFarmType,
  FarmsFiltersStateType,
} from './Farms.const'
import FarmsPopupsProvider from './FarmsPopups/FarmsPopups.provider'

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt=" No results to show" />
    <figcaption>No results to show</figcaption>
  </EmptyList>
)

export type HandleClickArgsType = { filterType: 'search' | 'sort' | 'isStaked' | 'isLive' | 'openCard' } & Partial<{
  newStakedValue: isStakedFarmType
  newLiveFinished: isLiveFarmType
  newSearchText: string
  newSortBy: string
  newOpenCardAddress: string
}>

export const Farms = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { search, pathname } = useLocation()

  const { farms, isLoaded } = useSelector((state: State) => state.farm)

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isLoaded) {
        await dispatch(getFarmStorage())
      }
    } catch (error) {}
  }, [])

  const [farmsList, setFarmsList] = useState(farms)
  const [farmsFilers, setFarmsFilters] = useState<FarmsFiltersStateType>({
    isStaked: NO_STAKED,
    openedFarmsCards: [],
    isLive: LIVE_TAB_ID,
    searchValue: '',
    sortBy: '',
    farmsViewVariant: VERTICAL_FARM_VIEW,
  })

  // pagination
  const listName = farmsFilers.farmsViewVariant === VERTICAL_FARM_VIEW ? FARMS_VERTICAL_CARDS : FARMS_HORIZONTAL_CARDS
  const paginatedFarms = useMemo(() => {
    const currentPage = getPageNumber(search, listName)
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return farmsList.slice(from, to)
  }, [farmsList, listName, search])

  /**
   * effect to track qp change and update filters state and filter/sort farms cards
   */
  useEffect(() => {
    const {
      openedFarmsCards = [],
      isLive = LIVE_TAB_ID,
      searchValue = '',
      sortBy = '',
      isStaked = NO_STAKED,
    } = qs.parse(search, { ignoreQueryPrefix: true }) as Partial<FarmsFiltersStateType>

    let filteredFarms = [...farms]
    if (Number(isStaked) !== farmsFilers.isStaked) {
      filteredFarms = filterByStaked(filteredFarms, Number(isStaked))
    }

    if (Number(isLive) !== farmsFilers.isLive) {
      filteredFarms = filterByLiveFinished(filteredFarms, Number(isLive))
    }

    if (searchValue !== farmsFilers.searchValue) {
      filteredFarms = filterBySearch(filteredFarms, searchValue)
    }

    if (sortBy !== farmsFilers.sortBy) {
      filteredFarms = sortFarms(filteredFarms, sortBy)
    }

    setFarmsFilters({
      ...farmsFilers,
      isStaked: Number(isStaked) as isStakedFarmType,
      openedFarmsCards,
      isLive: Number(isLive) as isLiveFarmType,
      searchValue,
      sortBy,
    })

    setFarmsList(filteredFarms)
  }, [search, farms])

  /**
   * @handleFilterClick fn to handle click on filter as we are storing filters in the qp
   * it will update query params and filtering will perform in an effect above
   */
  const handleFilterClick = useCallback(
    ({
      filterType,
      newStakedValue,
      newLiveFinished,
      newSearchText,
      newSortBy,
      newOpenCardAddress,
    }: HandleClickArgsType) => {
      const newFiltersForQP: Partial<FarmsFiltersStateType> = {
        isLive: farmsFilers.isLive,
        ...(farmsFilers.searchValue ? { searchValue: farmsFilers.searchValue } : {}),
        ...(farmsFilers.sortBy ? { sortBy: farmsFilers.sortBy } : {}),
        ...(farmsFilers.isStaked ? { isStaked: farmsFilers.isStaked } : {}),
      }

      if (filterType === 'isLive' && newLiveFinished) {
        newFiltersForQP.isLive = newLiveFinished
      }

      if (filterType === 'search' && newSearchText !== undefined) {
        newFiltersForQP.searchValue = newSearchText
      }

      if (filterType === 'isStaked' && newStakedValue !== undefined) {
        newFiltersForQP.isStaked = newStakedValue
      }

      if (filterType === 'sort' && newSortBy !== undefined) {
        newFiltersForQP.sortBy = newSortBy
      }

      if (filterType === 'openCard' && newOpenCardAddress !== undefined) {
        const newOpenedCardsArr = getNewOpenedCardsAddresses(farmsFilers.openedFarmsCards, newOpenCardAddress)
        newFiltersForQP.openedFarmsCards = newOpenedCardsArr
      }

      const stringifiedQP = qs.stringify(newFiltersForQP)
      history.replace(`${pathname}?${stringifiedQP}`)
    },
    [
      farmsFilers.isLive,
      farmsFilers.searchValue,
      farmsFilers.sortBy,
      farmsFilers.isStaked,
      farmsFilers.openedFarmsCards,
      history,
      pathname,
    ],
  )

  return (
    <Page>
      <PageHeader page={'farms'} />
      <FarmsPopupsProvider>
        <FarmsStyled>
          <FarmTopBar
            handleFilterClick={handleFilterClick}
            farmsFilters={farmsFilers}
            handleSetFarmsViewVariant={(newFarmsView) => {
              setFarmsFilters({ ...farmsFilers, farmsViewVariant: newFarmsView })
            }}
            className={farmsFilers.farmsViewVariant}
          />
          {isLoading ? (
            <DataLoaderWrapper className="tabLoader">
              <ClockLoader width={150} height={150} />
              <div className="text">Loading farms</div>
            </DataLoaderWrapper>
          ) : farmsList.length ? (
            <section className={`farm-list ${farmsFilers.farmsViewVariant}`}>
              {paginatedFarms.map((farm, index: number) => {
                const depositAmount = getSummDepositedAmount(farm.farmAccounts)
                return (
                  <FarmCard
                    farm={farm}
                    key={farm.address + index}
                    variant={farmsFilers.farmsViewVariant}
                    currentRewardPerBlock={farm.currentRewardPerBlock}
                    depositAmount={depositAmount}
                    expandCallback={() =>
                      handleFilterClick({ filterType: 'openCard', newOpenCardAddress: farm.address })
                    }
                    isOpenedCard={Boolean(farmsFilers.openedFarmsCards.find((address) => farm.address === address))}
                  />
                )
              })}
              <Pagination itemsCount={farmsList.length} listName={listName} />
            </section>
          ) : (
            <EmptyContainer />
          )}
        </FarmsStyled>
      </FarmsPopupsProvider>
    </Page>
  )
}
