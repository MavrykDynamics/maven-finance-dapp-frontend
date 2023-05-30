import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DataFeedCard } from 'pages/DataFeedsDetails/listItem/DataFeedCard.view'
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
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'

import { useDataFeedsUpdater } from 'providers/DataFeedsProvider/hooks/useDataFeedsUpdater'

// styles
import { Page } from 'styles'
import { DataFeedsSearchFilter, DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { useLocation } from 'react-router'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

/**
 * this page don't need loader, cuz feeds are loaded while initial loading, and by the time we get here
 * we already have feeds context loaded, and we just subscribe to it, and update feeds in background
 */

export const DataFeeds = () => {
  const { feedsAddresses, feedsMapper, feedsCategories } = useDataFeedsContext()

  const dispatch = useDispatch()
  const { search } = useLocation()
  const { isActionActive } = useSelector((state: State) => state.loading)

  const ddItems = useMemo(() => ['all', ...feedsCategories], [feedsCategories])

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [searchInputValue, setSearchInput] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState('all')
  const [filteredFeeds, setFilteredFeeds] = useState(feedsAddresses)

  const paginatedFeeds = useMemo(() => {
    const currentPage = getPageNumber(search, FEEDS_ALL_LIST_NAME)
    const [from, to] = calculateSlicePositions(currentPage, FEEDS_ALL_LIST_NAME)
    return filteredFeeds.slice(from, to)
  }, [filteredFeeds, search])

  useEffect(() => {
    setFilteredFeeds(
      feedsAddresses.filter((feedAddress) => {
        const { category, name, address } = feedsMapper[feedAddress]
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
  }, [feedsAddresses, chosenDdItem, searchInputValue, feedsMapper])

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
              {paginatedFeeds.map((feedAddress) => (
                <DataFeedCard feed={feedsMapper[feedAddress]} key={feedAddress} />
              ))}
            </div>

            <Pagination itemsCount={filteredFeeds.length} side={PAGINATION_SIDE_RIGHT} listName={FEEDS_ALL_LIST_NAME} />
          </>
        ) : (
          <EmptyContainer>
            <img src="/images/not-found.svg" alt=" No data feeds to show" />
            <figcaption> No data feeds to show</figcaption>
          </EmptyContainer>
        )}
      </DataFeedsStyled>
    </Page>
  )
}
