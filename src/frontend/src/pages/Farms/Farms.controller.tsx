import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import qs from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FarmTopBar } from './FarmTopBar/FarmTopBar.controller'
import { FarmCard } from './FarmCard/FarmCard.controller'
import { Modal } from '../../app/App.components/Modal/Modal.controller'

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
  STAKED,
  NO_STAKED,
  LIVE_TAB_ID,
  FINISHED_TAB_ID,
  VERTICAL_FARM_VIEW,
  isStakedFarmType,
  isLiveFarmType,
  FarmsFiltersStateType,
} from './Farms.const'

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

  useEffect(() => {
    const {
      openedFarmsCards = [],
      isLive = LIVE_TAB_ID,
      searchValue = '',
      sortBy = '',
      isStaked = NO_STAKED,
    } = qs.parse(search, { ignoreQueryPrefix: true }) as Partial<FarmsFiltersStateType>

    setFarmsFilters({
      ...farmsFilers,
      isStaked: Number(isStaked) as typeof STAKED | typeof NO_STAKED,
      openedFarmsCards,
      isLive: Number(isLive) as typeof LIVE_TAB_ID | typeof FINISHED_TAB_ID,
      searchValue,
      sortBy,
    })
  }, [search])

  const handleFilterClick = useCallback(
    ({
      filterType,
      newStakedValue,
      newLiveFinished,
      newSearchText,
      newSortBy,
      newOpenCardAddress,
    }: HandleClickArgsType) => {
      let filteredFarms = [...farms]

      const newFiltersForQP: Partial<FarmsFiltersStateType> = {
        isLive: farmsFilers.isLive,
        ...(farmsFilers.searchValue ? { searchValue: farmsFilers.searchValue } : {}),
        ...(farmsFilers.sortBy ? { sortBy: farmsFilers.sortBy } : {}),
        ...(farmsFilers.isStaked ? { isStaked: farmsFilers.isStaked } : {}),
      }

      if (filterType === 'isLive' && newLiveFinished) {
        filteredFarms = filterByLiveFinished(filteredFarms, newLiveFinished)
        newFiltersForQP.isLive = newLiveFinished
      }

      if (filterType === 'search' && newSearchText !== undefined) {
        filteredFarms = filterBySearch(filteredFarms, newSearchText)
        newFiltersForQP.searchValue = newSearchText
      }

      if (filterType === 'isStaked' && newStakedValue !== undefined) {
        filteredFarms = filterByStaked(filteredFarms, newStakedValue)
        newFiltersForQP.isStaked = newStakedValue
      }

      if (filterType === 'sort' && newSortBy !== undefined) {
        filteredFarms = sortFarms(filteredFarms, newSortBy)
        newFiltersForQP.sortBy = newSortBy
      }

      if (filterType === 'openCard' && newOpenCardAddress !== undefined) {
        const newOpenedCardsArr = getNewOpenedCardsAddresses(farmsFilers.openedFarmsCards, newOpenCardAddress)
        newFiltersForQP.openedFarmsCards = newOpenedCardsArr
      }

      setFarmsList(filteredFarms)
      const stringifiedQP = qs.stringify(newFiltersForQP)
      history.replace(`${pathname}?${stringifiedQP}`)
    },
    [
      farms,
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
                  expandCallback={() => handleFilterClick({ filterType: 'openCard', newOpenCardAddress: farm.address })}
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
      <Modal />
    </Page>
  )
}
