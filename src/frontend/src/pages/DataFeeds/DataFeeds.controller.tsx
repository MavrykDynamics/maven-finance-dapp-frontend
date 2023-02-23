import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import SatelliteList from 'pages/Satellites/SatelliteList/SatellitesList.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'

// const
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { FEEDS_ALL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

// types

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { INFO } from 'app/App.components/Toaster/Toaster.constants'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { getFeedsStorage } from './DataFeeds.actions'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No data feeds to show" />
    <figcaption> No data feeds to show</figcaption>
  </EmptyContainer>
)

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
          <SatelliteSearchFilter dataFeeds>
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
          </SatelliteSearchFilter>

          <DataFeedsStyled>
            {filteredFeeds.length ? (
              <SatelliteList items={filteredFeeds} listType={'feeds'} name={FEEDS_ALL_LIST_NAME} />
            ) : (
              emptyContainer
            )}
          </DataFeedsStyled>
        </>
      )}
    </Page>
  )
}
