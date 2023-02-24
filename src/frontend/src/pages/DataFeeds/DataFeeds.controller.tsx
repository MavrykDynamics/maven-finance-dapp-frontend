import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DataFeedCard } from 'pages/DataFeedsDetails/listItem/DataFeedCard.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import Pagination from 'app/Pagination/Pagination.view'

// const, actions
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { INFO } from 'app/App.components/Toaster/Toaster.constants'
import { FEEDS_ALL_LIST_NAME, PAGINATION_SIDE_RIGHT } from 'app/Pagination/pagination.consts'

// types, actions
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { getFeedsStorage } from './DataFeeds.actions'

// styles
import { Page } from 'styles'
import { DataFeedsSearchFilter, DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

export const DataFeeds = () => {
  const dispatch = useDispatch()
  const { feedsLedger, feedCategories, isLoaded: isDataFeedsLoaded } = useSelector((state: State) => state.dataFeeds)

  const { isLoading } = useDataLoader(async () => {
    try {
      if (!isDataFeedsLoaded) {
        await dispatch(getFeedsStorage())
      }
    } catch (e) {}
  }, [])

  const ddItems = useMemo(() => ['All', ...feedCategories], [feedCategories])

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [searchInputValue, setSearchInput] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<string>('All')
  const [filteredFeeds, setFilteredFeeds] = useState(feedsLedger)

  const handleSelect = (selectedOption: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedOption)

    if (selectedOption !== '' && selectedOption !== chosenDdItem) {
      setFilteredFeeds(
        selectedOption === 'All'
          ? feedsLedger
          : feedsLedger.filter(({ category }) => category?.toLowerCase() === selectedOption.toLowerCase()),
      )
    }
  }

  const handleSearch = ({ target: { value: searchValue } }: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(searchValue)
    setFilteredFeeds(
      searchValue === ''
        ? feedsLedger
        : feedsLedger.filter(
            (item: Feed) =>
              item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              item.address.toLowerCase().includes(searchValue.toLowerCase()),
          ),
    )
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
                  {filteredFeeds.map((item) => (
                    <DataFeedCard feed={item} key={item.address} />
                  ))}
                </div>

                <Pagination
                  itemsCount={filteredFeeds.length}
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
