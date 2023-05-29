import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DataFeedCard } from 'pages/DataFeedsDetails/listItem/DataFeedCard.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'

// const, actions
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INFO } from 'app/App.components/Toaster/Toaster.constants'
import {
  calculateSlicePositions,
  FEEDS_ALL_LIST_NAME,
  getPageNumber,
  PAGINATION_SIDE_RIGHT,
} from 'app/App.components/Pagination/pagination.consts'

// types, actions
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getFeedsStorage } from './DataFeeds.actions'

// styles
import { Page } from 'styles'
import { DataFeedsSearchFilter, DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { useLocation } from 'react-router'

export const DataFeeds = () => {
  const dispatch = useDispatch()
  const { search } = useLocation()
  const { feedsLedger, feedCategories, isLoaded: isDataFeedsLoaded } = useSelector((state: State) => state.dataFeeds)
  const { isActionActive } = useSelector((state: State) => state.loading)
  const datafortest = [...feedsLedger, ...feedsLedger, ...feedsLedger, ...feedsLedger, ...feedsLedger, ...feedsLedger]
  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isDataFeedsLoaded || isDepsChanged) {
        await dispatch(getFeedsStorage())
      }
    } catch (e) {}
  }, [])

  const ddItems = useMemo(() => ['all', ...feedCategories], [feedCategories])

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [searchInputValue, setSearchInput] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState('all')
  const [filteredFeeds, setFilteredFeeds] = useState(datafortest)

  const paginatedFeeds = useMemo(() => {
    const currentPage = getPageNumber(search, FEEDS_ALL_LIST_NAME)
    const [from, to] = calculateSlicePositions(currentPage, FEEDS_ALL_LIST_NAME)
    return filteredFeeds.slice(from, to)
  }, [filteredFeeds, search])

  useEffect(() => {
    setFilteredFeeds(
      datafortest.filter(({ category, name, address }) => {
        if (chosenDdItem === 'all') {
          return (
            name.toLowerCase().includes(searchInputValue.toLowerCase()) ||
            address.toLowerCase().includes(searchInputValue.toLowerCase())
          )
        }

        return (
          category?.toLowerCase() === chosenDdItem.toLowerCase() &&
          (name.toLowerCase().includes(searchInputValue.toLowerCase()) ||
            address.toLowerCase().includes(searchInputValue.toLowerCase()))
        )
      }),
    )
  }, [datafortest, chosenDdItem, searchInputValue])

  const handleSelect = (selectedOption: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedOption)
  }

  const handleSearch = ({ target: { value: searchValue } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(searchValue)
  }

  return (
    <Page>
      <PageHeader page={'data-feeds'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading data feeds</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <DataFeedsSearchFilter>
            <DropdownContainer className="dropDown">
              <h4>Category:</h4>
              {/* TODO: replace to new dd */}
              <DropDown
                placeholder="Choose category"
                isOpen={ddIsOpen}
                setIsOpen={setDdIsOpen}
                itemSelected={chosenDdItem}
                items={ddItems}
                clickOnItem={handleSelect}
              />
            </DropdownContainer>
            <Input
              type="text"
              kind={'search'}
              placeholder="Search data feed..."
              onChange={handleSearch}
              value={searchInputValue}
            />

            <Button
              text="Request data feed"
              icon="requestFeed"
              disabled={isActionActive}
              kind={ACTION_PRIMARY}
              onClick={() => {
                dispatch(showToaster(INFO, 'Coming soon', 'Request feed Feature coming soon'))
              }}
            />
          </DataFeedsSearchFilter>

          <DataFeedsStyled>
            {filteredFeeds.length ? (
              <>
                <div className="list-wrapper">
                  {paginatedFeeds.map((item) => (
                    <DataFeedCard feed={item} />
                  ))}
                </div>

                <Pagination
                  itemsCount={datafortest.length}
                  side={PAGINATION_SIDE_RIGHT}
                  listName={FEEDS_ALL_LIST_NAME}
                />
              </>
            ) : (
              <EmptyContainer>
                <img src="/images/not-found.svg" alt=" No data feeds to show" />
                <figcaption> No data feeds to show</figcaption>
              </EmptyContainer>
            )}
          </DataFeedsStyled>
        </>
      )}
    </Page>
  )
}
