import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router'

// consts
import {
  calculateSlicePositions,
  getPageNumber,
  PAGINATION_SIDE_RIGHT,
  SATELITES_NODES_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { INFO_ERROR } from 'app/App.components/Info/info.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { NOT_STAKING_MVK_TEXT } from 'app/App.components/Info/Banners/banners.texts'
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
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ALL_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { Info } from 'app/App.components/Info/Info.view'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { NotStakingBannerStyled } from 'app/App.components/Info/Banners/BecomeSatelliteBanners/BecomeSatelliteBanners.style'

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVK', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const ddItems = itemsForDropDown.map(({ text }) => text)

const SatelliteNodes = () => {
  const { pathname, search } = useLocation()

  const { userTokensBalances, userAddress } = useUserContext()
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

      {!isSatellite &&
      getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }) === 0 &&
      userAddress ? (
        <NotStakingBannerStyled>
          <Info text={NOT_STAKING_MVK_TEXT} type={INFO_ERROR}>
            <div className="link-btn">
              <Link to="/staking">
                <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE}>
                  <Icon id="staking" />
                  Staking
                </NewButton>
              </Link>
            </div>
          </Info>
        </NotStakingBannerStyled>
      ) : null}

      <PageContent className="mt-30">
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
