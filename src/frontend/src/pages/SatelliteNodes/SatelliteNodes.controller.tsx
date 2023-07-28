import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router'

// consts
import {
  calculateSlicePositions,
  PAGINATION_SIDE_RIGHT,
  SATELITES_NODES_LIST_NAME,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'
import { handleFilterSatellites, handleSortSatellites } from './SatelliteNodes.helpers'

import { DropDown, DropdownItemType } from '../../app/App.components/DropDown/DropDown.controller'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { SatelliteListItem } from 'pages/Satellites/listItem/SateliteCard.view'
import { Page, PageContent } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { DropdownContainer } from 'app/App.components/DropDown/DropDown.style'
import { SatelliteSearchFilter } from 'pages/Satellites/Satellites.style'
import { SatelliteNodesStyled } from './SatelliteNodes.style'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { NotStakingBanner } from 'pages/Satellites/components/NotStakingBanner.view'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITES_DATA_ALL_SUB,
} from 'providers/SatellitesProvider/satellites.const'

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const ddItems = itemsForDropDown.map(({ text }) => text)

const SatelliteNodes = () => {
  const { pathname, search } = useLocation()

  const { userTokensBalances } = useUserContext()
  const { isSatellite } = useUserContext()
  const {
    allSatellitesIds,
    satelliteMapper,
    proposalsAmount,
    satelliteGovActionsAmount,
    finRequestsAmount,
    isLoading: isSatellitesLoading,
    changeSatellitesSubscriptionsList,
  } = useSatellitesContext()

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ALL_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  const [filteredSatelliteList, setFilteredSatelliteList] = useState(allSatellitesIds)
  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [inputSearch, setInputSearch] = useState('')
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  const currentPage = getPageNumber(search, SATELITES_NODES_LIST_NAME)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, SATELITES_NODES_LIST_NAME)
    return filteredSatelliteList.slice(from, to)
  }, [currentPage, filteredSatelliteList])

  useEffect(() => {
    if (isSatellitesLoading) return

    const filteredSatellitesIds = [...allSatellitesIds]
      .filter(handleFilterSatellites(inputSearch, satelliteMapper))
      .sort(
        handleSortSatellites({
          sortType: chosenDdItem?.text ?? '',
          satelliteMapper,
          proposalsAmount,
          satelliteGovActionsAmount,
          finRequestsAmount,
        }),
      )

    setFilteredSatelliteList(filteredSatellitesIds)
  }, [
    allSatellitesIds,
    chosenDdItem?.text,
    finRequestsAmount,
    inputSearch,
    isSatellitesLoading,
    proposalsAmount,
    satelliteGovActionsAmount,
    satelliteMapper,
  ])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setInputSearch(e.target.value)

  const handleSelect = (e: string) => {
    const chosenItem = itemsForDropDown.find((item) => item.text === e)
    setChosenDdItem(chosenItem)
    setDdIsOpen(!ddIsOpen)
  }

  return (
    <Page>
      <PageHeader page={'satellites'} />

      {!isSatellite && getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS }) === 0 ? (
        <NotStakingBanner text="You are currently not staking MVK, please stake MVK in order to delegate to a satellite or become your own and take part in the platform’s governance" />
      ) : null}

      <PageContent>
        {isSatellitesLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading satellites data</div>
          </DataLoaderWrapper>
        ) : (
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
                {paginatedItemsList.map((satelliteAddress) => {
                  if (!satelliteMapper[satelliteAddress]) return null
                  return <SatelliteListItem satellite={satelliteMapper[satelliteAddress]} key={satelliteAddress} />
                })}

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
        )}

        <SatellitesSideBar />
      </PageContent>
    </Page>
  )
}

export default SatelliteNodes
