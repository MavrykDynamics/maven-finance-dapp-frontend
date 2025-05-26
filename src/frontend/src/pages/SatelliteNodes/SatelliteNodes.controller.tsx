import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

// consts
import {
  getPageNumber,
  PAGINATION_SIDE_RIGHT,
  SATELITES_NODES_LIST_NAME,
} from 'app/App.components/Pagination/pagination.consts'
import { INFO_ERROR } from 'app/App.components/Info/info.constants'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { NOT_STAKING_MVN_TEXT } from 'app/App.components/Info/Banners/banners.texts'

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
  SATELLITE_PAGINATION_ALL,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ALL_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { Info } from 'app/App.components/Info/Info.view'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { NotStakingBannerStyled } from 'app/App.components/Info/Banners/BecomeSatelliteBanners/BecomeSatelliteBanners.style'
import { useDebouncedSearch } from 'app/App.hooks/useDebouncedSerach'
import {
  getSatelliteOrderByQuery,
  getSatelliteSearchQueryForWhereFilter,
} from 'providers/SatellitesProvider/helpers/satellite.filters'
import { Satellite_Bool_Exp } from 'utils/__generated__/graphql'

const itemsForDropDown = [
  { text: 'Lowest Fee', value: 'satelliteFee' },
  { text: 'Highest Fee', value: 'satelliteFee' },
  { text: 'Delegated MVN', value: 'totalDelegatedAmount' },
  { text: 'Participation', value: 'participation' },
]

const ddItems = itemsForDropDown.map(({ text }) => text)

const SatelliteNodes = () => {
  const { search } = useLocation()

  const { userTokensBalances, userAddress } = useUserContext()
  const { isSatellite } = useUserContext()
  const {
    allSatellitesIds,
    satelliteMapper,
    isLoading: isSatellitesLoading,
    changeSatellitesSubscriptionsList,
    changePage,
    updateSatelliteQueryFilters,
    totalSatellitesCount,
  } = useSatellitesContext()

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<DropdownItemType | undefined>()

  // Search --------------
  const { inputValue, debouncedValue, handleChange } = useDebouncedSearch()
  const hasTouchedInput = useRef(false)

  const currentPage = useMemo(() => getPageNumber(search, SATELITES_NODES_LIST_NAME), [search])

  const applyServerFilters = useCallback(() => {
    let whereQuery: { where: Partial<Satellite_Bool_Exp> } = { where: {} }

    const orderByQuery = getSatelliteOrderByQuery(chosenDdItem?.text ?? '')

    if (hasTouchedInput.current) {
      const searchFilterQuery = getSatelliteSearchQueryForWhereFilter(debouncedValue)

      whereQuery = {
        ...whereQuery,
        where: { ...whereQuery.where, ...searchFilterQuery.where },
      }
    }

    const query = { ...whereQuery, ...orderByQuery }

    updateSatelliteQueryFilters(query, SATELLITE_PAGINATION_ALL)
    // setIsPendingQueryWhenFilters(true)
  }, [chosenDdItem?.text, updateSatelliteQueryFilters, debouncedValue])

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_ALL_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  // search filter
  useEffect(() => {
    if (!hasTouchedInput.current) return
    applyServerFilters()
  }, [debouncedValue])

  useEffect(() => {
    if (chosenDdItem?.text) {
      applyServerFilters()
    }
  }, [chosenDdItem?.text])

  useEffect(() => {
    changePage(currentPage, SATELLITE_PAGINATION_ALL)
  }, [changePage, currentPage])

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
          <Info text={NOT_STAKING_MVN_TEXT} type={INFO_ERROR}>
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
                onChange={(e) => {
                  hasTouchedInput.current = true
                  handleChange(e.target.value)
                }}
                value={inputValue}
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

            {allSatellitesIds ? (
              <div className={`list`}>
                {allSatellitesIds.map((satelliteAddress) => {
                  if (!satelliteMapper[satelliteAddress]) return null
                  return <SatelliteListItem satellite={satelliteMapper[satelliteAddress]} key={satelliteAddress} />
                })}

                <Pagination
                  itemsCount={totalSatellitesCount}
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
