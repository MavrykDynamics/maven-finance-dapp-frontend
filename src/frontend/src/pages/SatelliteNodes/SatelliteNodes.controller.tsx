import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'

// helpers, actions
import { State } from 'reducers'

// consts
import {
  calculateSlicePositions,
  PAGINATION_SIDE_RIGHT,
  SATELITES_NODES_LIST_NAME,
  getPageNumber,
} from 'app/Pagination/pagination.consts'
import { handleFilterSatellites, handleSortSatellites } from './SatelliteNodes.helpers'

import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import Pagination from 'app/Pagination/Pagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/Satellites.style'
import { SatelliteNodesStyled } from './SatelliteNodes.style'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const SatelliteNodes = () => {
  const { pathname, search } = useLocation()

  const { allSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)

  const [filteredSatelliteList, setFilteredSatelliteList] = useState(allSatellitesIds)
  const [ddItems, _] = useState(itemsForDropDown.map(({ text }) => text))
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [inputSearch, setInputSearch] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const currentPage = getPageNumber(search, SATELITES_NODES_LIST_NAME)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, SATELITES_NODES_LIST_NAME)
    return filteredSatelliteList.slice(from, to)
  }, [currentPage, filteredSatelliteList])

  useEffect(() => {
    const filteredSatellitesIds = [...allSatellitesIds]
      .filter(handleFilterSatellites(inputSearch, satelliteMapper))
      .sort(handleSortSatellites(chosenDdItem?.text ?? '', satelliteMapper))

    setFilteredSatelliteList(filteredSatellitesIds)
  }, [allSatellitesIds, chosenDdItem?.text, inputSearch, satelliteMapper])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setInputSearch(e.target.value)

  const handleSelect = (e: string) => {
    const chosenItem = itemsForDropDown.find((item) => item.text === e)
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  return (
    <Page>
      <PageHeader page={'satellites'} />

      <PageContent>
        <SatelliteNodesStyled>
          <SatelliteSearchFilter>
            <Input
              type="text"
              kind={'search'}
              placeholder="Search by address or name..."
              onChange={handleSearch}
              value={inputSearch}
            />
            <DropdownContainer>
              <h4>Order by:</h4>
              <DropDown
                placeholder="Choose option"
                isOpen={ddIsOpen}
                setIsOpen={setDdIsOpen}
                itemSelected={chosenDdItem?.text}
                items={ddItems}
                clickOnItem={handleSelect}
              />
            </DropdownContainer>
          </SatelliteSearchFilter>

          {paginatedItemsList ? (
            <div className={`list`}>
              {paginatedItemsList.map((satelliteAddress) => (
                <SatelliteListItem satellite={satelliteMapper[satelliteAddress]} key={satelliteAddress} />
              ))}

              <Pagination
                itemsCount={filteredSatelliteList.length}
                side={PAGINATION_SIDE_RIGHT}
                listName={SATELITES_NODES_LIST_NAME}
              />
            </div>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No satellites to show" />
              <figcaption> No satellites to show</figcaption>
            </EmptyContainer>
          )}
        </SatelliteNodesStyled>

        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default SatelliteNodes
