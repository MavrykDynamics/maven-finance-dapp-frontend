import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import qs from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { FarmTopBar, LIVE_TAB_ID } from './FarmTopBar/FarmTopBar.controller'
import { FarmCard } from './FarmCard/FarmCard.controller'
import { Modal } from '../../app/App.components/Modal/Modal.controller'

// helpers
import { calculateAPY, getSummDepositedAmount } from './Farms.helpers'

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

export const VERTICAL_FARM_VIEW = 'vertical'
export const HORIZONTAL_FARM_VIEW = 'horizontal'
export type FarmsViewVariantType = typeof VERTICAL_FARM_VIEW | typeof HORIZONTAL_FARM_VIEW

const EmptyContainer = () => (
  <EmptyList>
    <img src="/images/not-found.svg" alt=" No results to show" />
    <figcaption>No results to show</figcaption>
  </EmptyList>
)

export const Farms = () => {
  const dispatch = useDispatch()
  const history = useHistory()
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { farmStorage } = useSelector((state: State) => state.farm)

  const [farmsList, setFarmsList] = useState(farmStorage)

  // filters states
  const [toggleChecked, setToggleChecked] = useState(false)
  const [openedFarmsCards, setOpenedFarmsCards] = useState<Array<string>>([])
  const [liveFinished, setLiveFinished] = useState<number>(LIVE_TAB_ID)
  const [searchValue, setSearchValue] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [farmsViewVariant, setFarmsViewVariant] = useState<FarmsViewVariantType>(VERTICAL_FARM_VIEW)

  const { search, pathname } = useLocation()
  const {
    openedCards = [],
    isLive = LIVE_TAB_ID,
    searchFarm = '',
    sortType = '',
    isStakedOny = false,
  } = useMemo(
    () =>
      qs.parse(search, { ignoreQueryPrefix: true }) as {
        openedCards?: Array<string>
        isLive?: number
        searchFarm?: string
        sortType?: string
        isStakedOny?: boolean
      },
    [search],
  )

  // pagination stuff
  const listName = useMemo(
    () => (farmsViewVariant === VERTICAL_FARM_VIEW ? FARMS_VERTICAL_CARDS : FARMS_HORIZONTAL_CARDS),
    [farmsViewVariant],
  )

  const currentPage = useMemo(() => getPageNumber(search, listName), [search, listName])

  const farmsCards = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return farmsList?.slice(from, to)
  }, [farmsList, isLive, searchFarm, sortType, isStakedOny, currentPage, listName])

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getFarmStorage())
    } catch (error) {}
  }, [])

  // effect to set all filters state from queryParams on mount
  useEffect(() => {
    setToggleChecked(isStakedOny)
    setSearchValue(searchFarm)
    setSortBy(sortType)
    setLiveFinished(Number(isLive))
    setOpenedFarmsCards(openedCards)
  }, [])

  const handleFilterClick = useCallback(
    ({
      newStakedNoValue,
      newLiveFinished,
      newSearchText,
      newSortBy,
      newOpenedCards,
    }: Partial<{
      newStakedNoValue: boolean
      newLiveFinished: number
      newSearchText: string
      newSortBy: string
      newOpenedCards: Array<string>
    }>) => {
      // creating qp object and update qp
      const filtersQP = {
        openedCards: newOpenedCards ?? openedCards,
        isLive: newLiveFinished ?? liveFinished,
        ...(newSearchText ?? searchValue ? { searchFarm: newSearchText ?? searchValue } : {}),
        ...(newSortBy ?? sortBy ? { sortType: newSortBy ?? sortBy } : {}),
        ...(newStakedNoValue ?? toggleChecked ? { isStakedOny: newStakedNoValue ?? toggleChecked } : {}),
      }

      const stringifiedQP = qs.stringify(filtersQP)
      history.push(`${pathname}?${stringifiedQP}`)
    },
    [toggleChecked, liveFinished, openedFarmsCards, pathname, searchValue, sortBy],
  )

  // fn to add/remove card address fron query params, is it open or not
  const handleOpenCard = useCallback(
    (cardAdrress: string) => {
      const newOpenedCards = openedFarmsCards.find((openCardAddress) => openCardAddress === cardAdrress)
        ? openedFarmsCards.filter((openCardAddress) => openCardAddress !== cardAdrress)
        : openedFarmsCards.concat(cardAdrress)

      setOpenedFarmsCards(newOpenedCards)
      handleFilterClick({ newOpenedCards })
    },
    [handleFilterClick, openedFarmsCards],
  )

  // effect to handle all sortings and filters in top bar
  useEffect(() => {
    let farmsToSortFilter = [...farmStorage]

    // apply live finished filter
    farmsToSortFilter = farmsToSortFilter.filter(({ isLive }) =>
      liveFinished === 1 ? isLive === true : isLive === false,
    )

    // apply staked only filter
    farmsToSortFilter = toggleChecked
      ? farmsToSortFilter.filter(
          (item) => item.farmAccounts?.length && item.farmAccounts.some((account) => account?.deposited_amount > 0),
        )
      : farmsToSortFilter

    // apply search
    farmsToSortFilter = searchValue.length
      ? farmsToSortFilter.filter(({ lpTokenAddress, name }) => {
          const isIncludesTokenAddress = lpTokenAddress.includes(searchValue)
          const isIncludesName = name.includes(searchValue)
          return isIncludesTokenAddress || isIncludesName
        })
      : farmsToSortFilter

    // apply sorting
    if (sortBy) {
      const dataToSort = farmsToSortFilter ? [...farmsToSortFilter] : []
      dataToSort.sort((a, b) => {
        let res = 0
        switch (sortBy) {
          case 'active':
            res = Number(a.open) - Number(b.open)
            break
          case 'highestAPY':
            res =
              calculateAPY(a.currentRewardPerBlock, a.lpBalance) < calculateAPY(b.currentRewardPerBlock, b.lpBalance)
                ? 1
                : -1
            break
          case 'lowestAPY':
            res =
              calculateAPY(a.currentRewardPerBlock, a.lpBalance) > calculateAPY(b.currentRewardPerBlock, b.lpBalance)
                ? 1
                : -1
            break
          case 'highestLiquidity':
            res = a.lpBalance < b.lpBalance ? 1 : -1
            break
          case 'lowestLiquidity':
            res = a.lpBalance > b.lpBalance ? 1 : -1
            break
          case 'yourLargestStake':
            res = getSummDepositedAmount(a.farmAccounts) < getSummDepositedAmount(b.farmAccounts) ? 1 : -1
            break
          case 'rewardsPerBlock':
            res = a.currentRewardPerBlock < b.currentRewardPerBlock ? 1 : -1
            break
          default:
            res = 1
            break
        }
        return res
      })
      setFarmsList(dataToSort)
    } else {
      setFarmsList(farmsToSortFilter)
    }
  }, [farmStorage, liveFinished, searchValue, toggleChecked, sortBy])

  // Handler for top bar
  const handleToggleStakedFarmsOnly = (e?: { target: { checked: boolean } }) => {
    setToggleChecked(Boolean(e?.target?.checked))
    handleFilterClick({ newStakedNoValue: Boolean(e?.target?.checked) })
  }

  const handleSetFarmsViewVariant = (variant: FarmsViewVariantType) => {
    setFarmsViewVariant(variant)
  }

  const handleLiveFinishedToggleButtons = (tabId: number) => {
    setLiveFinished(tabId)
    handleFilterClick({ newLiveFinished: tabId })
  }

  const handleOnSearch = (text: string) => {
    setSearchValue(text)
    handleFilterClick({ newSearchText: text })
  }

  const handleOnSort = (sortValue: string) => {
    setSortBy(sortValue)
    handleFilterClick({ newSortBy: sortValue })
  }

  return (
    <Page>
      <PageHeader page={'farms'} />
      <FarmsStyled>
        <FarmTopBar
          ready={Boolean(accountPkh)}
          searchValue={searchValue}
          onSearch={handleOnSearch}
          onSort={handleOnSort}
          handleToggleStakedOnly={handleToggleStakedFarmsOnly}
          handleLiveFinishedToggleButtons={handleLiveFinishedToggleButtons}
          handleSetFarmsViewVariant={handleSetFarmsViewVariant}
          className={farmsViewVariant}
          toggleChecked={toggleChecked}
          liveFinishedIdSelected={liveFinished}
        />
        {isLoading ? (
          <DataLoaderWrapper className="tabLoader">
            <ClockLoader width={150} height={150} />
            <div className="text">Loading farms</div>
          </DataLoaderWrapper>
        ) : farmsList.length ? (
          <section className={`farm-list ${farmsViewVariant}`}>
            {farmsCards.map((farm, index: number) => {
              const depositAmount = getSummDepositedAmount(farm.farmAccounts)
              return (
                <FarmCard
                  farm={farm}
                  key={farm.address + index}
                  variant={farmsViewVariant}
                  currentRewardPerBlock={farm.currentRewardPerBlock}
                  depositAmount={depositAmount}
                  expandCallback={handleOpenCard}
                  isOpenedCard={Boolean(openedCards.find((address) => farm.address === address))}
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
