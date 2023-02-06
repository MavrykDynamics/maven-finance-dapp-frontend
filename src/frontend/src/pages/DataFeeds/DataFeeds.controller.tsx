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
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

// styles
import { Page } from 'styles'
import { DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/SatelliteList/SatelliteList.style'
import { getOracleStorage } from 'pages/Satellites/Satellites.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { INFO } from 'app/App.components/Toaster/Toaster.constants'

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No oracles to show</figcaption>
  </EmptyContainer>
)
// TODO: filters after category field will be implemented
export const DataFeeds = () => {
  const dispatch = useDispatch()
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const { feedCategories } = oraclesStorage

  const ddItems = useMemo(() => ['All', ...feedCategories], [feedCategories])

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [searchInputValue, setSearchInput] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<string>('All')
  const [allSatellites, setAllSatellites] = useState<Feed[]>(oraclesStorage.feeds)
  const [filteredFeeds, setFilteredFeeds] = useState<Feed[]>(oraclesStorage.feeds)

  const handleSelect = (selectedOption: string) => {
    setDdIsOpen(!ddIsOpen)
    setChosenDdItem(selectedOption)

    const newFilteredItems =
      selectedOption === 'All'
        ? oraclesStorage.feeds
        : oraclesStorage.feeds.filter(({ category }) => category?.toLowerCase() === selectedOption.toLowerCase())

    if (selectedOption !== '' && selectedOption !== chosenDdItem) {
      setFilteredFeeds(newFilteredItems)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value
    let searchResult: Feed[] = []
    if (searchQuery !== '') {
      searchResult = allSatellites.filter(
        (item: Feed) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    } else {
      searchResult = allSatellites
    }

    setSearchInput(e.target.value)
    setFilteredFeeds(searchResult)
  }

  useEffect(() => {
    setAllSatellites(oraclesStorage.feeds)
    setFilteredFeeds(oraclesStorage.feeds)
  }, [oraclesStorage.feeds])

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getOracleStorage())
    } catch (e) {
      //TODO: handle fetch error
    }
  }, [])

  return (
    <Page>
      <PageHeader page={'data-feeds'} />
      <SatelliteSearchFilter dataFeeds>
        {
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
        }
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
            // TODO: implement request data feed ORACLE_SI
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
    </Page>
  )
}
