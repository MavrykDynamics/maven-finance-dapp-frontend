import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'

// helpers, actions
import { State } from 'reducers'
import { delegate, undelegate } from 'pages/Satellites/Satellites.actions'

// consts
import {
  calculateSlicePositions,
  PAGINATION_SIDE_RIGHT,
  SATELITES_NODES_LIST_NAME,
  getPageNumber,
} from 'app/Pagination/pagination.consts'

import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import Pagination from 'app/Pagination/Pagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/Satellites.style'

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const SatelliteNodes = () => {
  const { allSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const { satelliteMvkIsDelegatedTo, mySMvkTokenBalance } = useSelector((state: State) => state.wallet.user)
  const dispatch = useDispatch()
  const { pathname, search } = useLocation()

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
    setFilteredSatelliteList(allSatellitesIds)
  }, [allSatellitesIds])

  const handleSearch = (e: {
    target: {
      value: string
    }
  }) => {
    const searchQuery = e.target.value
    if (searchQuery !== '') {
      setFilteredSatelliteList(
        allSatellitesIds.filter((satelliteAddress) => {
          const satellite = satelliteMapper[satelliteAddress]
          return (
            satellite.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            satellite.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }),
      )
    } else {
      setFilteredSatelliteList(allSatellitesIds)
    }
    setInputSearch(searchQuery)
  }

  const handleSelect = (e: string) => {
    const chosenItem = itemsForDropDown.find((item) => item.text === e)
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)

    if (!chosenItem) return

    const sortedData = (filteredSatelliteList ? [...filteredSatelliteList] : []).sort((a, b) => {
      const satelliteA = satelliteMapper[a],
        satelliteB = satelliteMapper[b]
      let res = 0
      switch (chosenItem.text) {
        case 'Lowest Fee':
          res = satelliteA.satelliteFee - satelliteB.satelliteFee
          break
        case 'Highest Fee':
          res = satelliteB.satelliteFee - satelliteA.satelliteFee
          break
        case 'Delegated MVK':
          res =
            satelliteB.totalDelegatedAmount +
            satelliteB.sMvkBalance -
            (satelliteA.totalDelegatedAmount + satelliteA.sMvkBalance)
          break
        case 'Participation':
          res =
            (satelliteB.satelliteMetrics.proposalParticipation + satelliteB.satelliteMetrics.votingPartisipation) / 2 -
            (satelliteA.satelliteMetrics.proposalParticipation + satelliteA.satelliteMetrics.votingPartisipation) / 2
          break
        default:
          return 0
      }
      return res
    })

    setFilteredSatelliteList(sortedData)
  }

  const delegateCallback = useCallback((satelliteAddress: string) => {
    dispatch(delegate(satelliteAddress))
  }, [])

  const undelegateCallback = useCallback((delegateAddress: string) => {
    dispatch(undelegate(delegateAddress))
  }, [])

  return (
    <Page>
      <PageHeader page={'satellites'} />

      <PageContent>
        <div className="left-content-wrapper">
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
            <div className={`satellitesList`}>
              {paginatedItemsList.map((satelliteAddress) => (
                <SatelliteListItem
                  satellite={satelliteMapper[satelliteAddress]}
                  key={satelliteAddress}
                  delegateCallback={delegateCallback}
                  undelegateCallback={undelegateCallback}
                  userStakedBalance={mySMvkTokenBalance}
                  satelliteUserIsDelegatedTo={satelliteMvkIsDelegatedTo}
                />
              ))}

              <Pagination
                itemsCount={filteredSatelliteList.length}
                side={PAGINATION_SIDE_RIGHT}
                listName={SATELITES_NODES_LIST_NAME}
              />
            </div>
          ) : (
            <EmptyContainer>
              <img src="/images/not-found.svg" alt=" No proposals to show" />
              <figcaption> No oracles to show</figcaption>
            </EmptyContainer>
          )}
        </div>
      </PageContent>
    </Page>
  )
}

export default SatelliteNodes
