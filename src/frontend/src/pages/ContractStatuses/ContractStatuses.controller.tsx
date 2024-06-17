import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import qs from 'qs'

// components
import { ContractCard } from './ContractCard/ContractCard.controller'
import NewButton from 'app/App.components/Button/NewButton'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// helpers
import {
  BREAK_GLASS_LIST_NAME,
  calculateSlicePositions,
  getPageNumber,
  updatePageInUrl,
} from 'app/App.components/Pagination/pagination.consts'
import { BUTTON_NAVIGATION } from 'app/App.components/Button/Button.constants'

// styles
import {
  BGCardsWrapper,
  BGInfo,
  BGMiddleWrapper,
  BGPrimaryTitle,
  BGStatusIndicator,
  BGStyled,
  BGTop,
  BGWhitelist,
} from './ContractStatuses.style'
import { Page } from 'styles'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
} from 'providers/ContractStatuses/helpers/contractStatuses.consts'

const ALL = 'All Contracts'
const GENERAL = 'General Contracts'

// TODO: validate tab in url?
export const ContractStatuses = () => {
  const {
    isLoading: isContractStatusesLoading,
    config: { isGlassBroken, whitelistDevelopers, areContractMethodsPaused },
    contractStatuses,
    changeContractStatusesSubscriptionsList,
  } = useContractStatusesContext()

  const { search, pathname } = useLocation()
  const navigate = useNavigate()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })

  const [selectedContract, setSelectedContract] = useState<string>(ALL)
  const [activeCard, setActiveCard] = React.useState<null | string>(null)
  const [openedAccordeon, setOpenedAcordeon] = React.useState<null | string>(null)

  useEffect(() => {
    changeContractStatusesSubscriptionsList({
      [CONTRACT_STATUSES_ALL_SUB]: true,
      [CONTRACT_STATUSES_CONFIG_SUB]: true,
    })

    return () => {
      changeContractStatusesSubscriptionsList(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)
    }
  }, [])

  const uniqueContracts = useMemo(() => {
    const uniqueAllContracts = contractStatuses
      ? (Array.from(new Set(contractStatuses.map((key) => key.type))) as string[])
      : []
    return [ALL, ...uniqueAllContracts.filter((item) => item !== GENERAL)]
  }, [contractStatuses])

  const filteredcontractStatuses = useMemo(() => {
    return selectedContract === ALL
      ? contractStatuses
      : contractStatuses?.filter((item) => selectedContract === item.type)
  }, [contractStatuses, selectedContract])

  const currentPage = getPageNumber(search, BREAK_GLASS_LIST_NAME)

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_LIST_NAME)
    return filteredcontractStatuses?.slice(from, to)
  }, [currentPage, filteredcontractStatuses])

  const handleTabChange = () => {
    // this is required to reset the page number when changing the tab
    const generateNewUrl = updatePageInUrl({
      page,
      newPage: 1,
      listName: BREAK_GLASS_LIST_NAME,
      pathname,
      restQP: rest,
    })
    navigate(generateNewUrl)
  }

  return (
    <Page>
      <PageHeader page={'break glass'} />
      {isContractStatusesLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading contracts statuses</div>
        </DataLoaderWrapper>
      ) : (
        <BGStyled>
          <BGTop>
            <BGInfo>
              <BGStatusIndicator>
                <div className="status-indicator-wrapper">
                  Status:{' '}
                  <span className={isGlassBroken ? 'color-red' : 'color-green'}>
                    {isGlassBroken ? 'glass broken' : 'not broken'}
                  </span>
                </div>
                <div className="status-indicator-wrapper">
                  Pause All:{' '}
                  <span className={areContractMethodsPaused ? 'color-red' : 'color-green'}>
                    {areContractMethodsPaused ? 'paused' : 'not paused'}
                  </span>
                </div>
              </BGStatusIndicator>

              <p>
                The breakglass protocol (BGP) allows MVN holders to shutdown the system without waiting for a central
                authority. The BGP is triggered through the Emergency governance vote.
              </p>

              <FAQLink className="BG-faq-link">
                <a
                  href="https://docs.mavenfinance.io/maven-finance/governance/emergency-governance"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read documentation here
                </a>
              </FAQLink>

              <BGWhitelist>
                Whitelist Developers
                <div className="adress-list">
                  {whitelistDevelopers.length > 0 ? (
                    whitelistDevelopers.map((devAddress) => (
                      <TzAddress key={devAddress} tzAddress={devAddress} type={PRIMARY_TZ_ADDRESS_COLOR} hasIcon />
                    ))
                  ) : (
                    <div>None</div>
                  )}
                </div>
              </BGWhitelist>
              <div className="line"></div>
            </BGInfo>
          </BGTop>

          <BGMiddleWrapper>
            <BGPrimaryTitle>Contract Status 2</BGPrimaryTitle>
            <div className="buttons-selector">
              {uniqueContracts.map((item) => (
                <NewButton
                  key={item}
                  kind={BUTTON_NAVIGATION}
                  selected={item === selectedContract}
                  onClick={() => {
                    setSelectedContract(item)
                    handleTabChange()
                  }}
                >
                  {item}
                </NewButton>
              ))}
            </div>
          </BGMiddleWrapper>

          <BGCardsWrapper>
            <div className="cards-list">
              {paginatedMyPastCouncilActions.map((item) => {
                const trimmedTitle = item.title.trim()
                const address = item.address.trim()
                const isCardActive = activeCard === address
                return (
                  <ContractCard
                    isActive={isCardActive}
                    contract={item}
                    key={trimmedTitle + address}
                    onClick={() => setActiveCard(isCardActive ? null : address)}
                    isExpanded={openedAccordeon === item.address}
                    handleExpandAccordeon={setOpenedAcordeon}
                  />
                )
              })}
            </div>
            <Pagination itemsCount={filteredcontractStatuses.length} listName={BREAK_GLASS_LIST_NAME} />
          </BGCardsWrapper>
        </BGStyled>
      )}
    </Page>
  )
}
