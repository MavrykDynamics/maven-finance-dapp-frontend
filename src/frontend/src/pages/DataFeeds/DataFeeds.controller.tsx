import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import Button from 'app/App.components/Button/NewButton'
import { Input } from 'app/App.components/Input/Input.controller'
import { DropDown } from 'app/App.components/DropDown/DropDown.controller'
import { DataFeedCard } from 'pages/DataFeedsDetails/listItem/DataFeedCard.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'

// const, actions
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import {
  calculateSlicePositions,
  FEEDS_ALL_LIST_NAME,
  getPageNumber,
  PAGINATION_SIDE_RIGHT,
} from 'app/App.components/Pagination/pagination.consts'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

// view
import { Page } from 'styles'
import { DataFeedsSearchFilter, DataFeedsStyled } from './DataFeeds.styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import Icon from 'app/App.components/Icon/Icon.view'

export const DataFeeds = () => {
  const { feedsAddresses, feedsMapper, feedsCategories } = useDataFeedsContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { info } = useToasterContext()

  const { search } = useLocation()

  const ddItems = useMemo(() => ['All', ...feedsCategories], [feedsCategories])

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
        if (chosenDdItem.toLowerCase() === 'all') {
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
          disabled={isActionActive}
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={() => {
            info('Coming soon', 'Request feed Feature coming soon')
          }}
        >
          <Icon id="request_data_feed" />
          Request data feed
        </Button>
      </DataFeedsSearchFilter>

      <DataFeedsStyled>
        {filteredFeeds.length ? (
          <>
            <div className="list-wrapper">
              {paginatedFeeds.map((feedAddress) => (
                <DataFeedCard
                  feed={feedsMapper[feedAddress]}
                  oracleNodes={feedsMapper[feedAddress].oraclesAmount}
                  key={feedAddress}
                />
              ))}
            </div>

            <Pagination
              itemsCount={feedsAddresses.length}
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
    </Page>
  )
}
