import React, { useMemo, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import qs from 'qs'

// components
import { ContractCard } from './ContractCard/ContractCard.controller'
import NewButton from 'app/App.components/Button/NewButton.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// helpers
import { BREAK_GLASS_LIST_NAME, calculateSlicePositions } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { NAV_SIMPLE } from 'app/App.components/Button/Button.constants'
import { updatePageInUrl } from 'pages/FinacialRequests/FinancialRequests.helpers'

// styles
import {
  BGCardsWrapper,
  BGInfo,
  BGMiddleWrapper,
  BGStatusIndicator,
  BGStyled,
  BGPrimaryTitle,
  BGTop,
  BGWhitelist,
  Pagination,
} from './BreakGlass.style'
import { FAQLink } from '../Satellites/SatellitesSideBar/SatelliteSideBar.style'
import { BreakGlassStatusStorage } from 'utils/TypesAndInterfaces/BreakGlass'

type BreakGlassViewProps = {
  glassBroken: boolean
  whitelistDev: string
  pauseAllActive: boolean
  breakGlassStatuses: BreakGlassStatusStorage
}

const ALL = 'All Contracts'
const GENERAL = 'General Contracts'

export const BreakGlassView = ({
  glassBroken,
  pauseAllActive,
  breakGlassStatuses,
  whitelistDev,
}: BreakGlassViewProps) => {
  const { search, pathname } = useLocation()
  const history = useHistory()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })

  const [selectedContract, setSelectedContract] = useState<string>(ALL)
  const [activeCard, setActiveCard] = React.useState<null | string>(null)
  const [openedAccordeon, setOpenedAcordeon] = React.useState<null | string>(null)

  const uniqueContracts = useMemo(() => {
    const uniqueAllContracts = breakGlassStatuses
      ? (Array.from(new Set(breakGlassStatuses.map((key) => key.type))) as string[])
      : []
    return [ALL, ...uniqueAllContracts.filter((item) => item !== GENERAL)]
  }, [breakGlassStatuses])

  const filteredBreakGlassStatuses = useMemo(() => {
    return selectedContract === ALL
      ? breakGlassStatuses
      : breakGlassStatuses?.filter((item) => selectedContract === item.type)
  }, [breakGlassStatuses, selectedContract])

  const currentPage = getPageNumber(search, BREAK_GLASS_LIST_NAME)

  const paginatedMyPastCouncilActions = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, BREAK_GLASS_LIST_NAME)
    return filteredBreakGlassStatuses?.slice(from, to)
  }, [currentPage, filteredBreakGlassStatuses])

  const handleTabChange = () => {
    // this is required to reset the page number when changing the tab
    const generateNewUrl = updatePageInUrl({
      page,
      newPage: 1,
      listName: BREAK_GLASS_LIST_NAME,
      pathname,
      restQP: rest,
    })
    history.push(generateNewUrl)
  }

  return (
    <BGStyled className={'breakGlassContainer'}>
      <BGTop>
        <BGInfo>
          <BGStatusIndicator>
            <div className="status-indicator-wrapper">
              Status:{' '}
              <span className={glassBroken ? 'color-red' : 'color-green'}>
                {glassBroken ? 'glass broken' : 'not broken'}
              </span>
            </div>
            <div className="status-indicator-wrapper">
              Pause All:{' '}
              <span className={pauseAllActive ? 'color-red' : 'color-green'}>
                {pauseAllActive ? 'paused' : 'not paused'}
              </span>
            </div>
          </BGStatusIndicator>

          <p>
            The breakglass protocol (BGP) allows MVK holders to shutdown the system without waiting for a central
            authority. The BGP is triggered through the Emergency governance vote.
          </p>

          <FAQLink className="BG-faq-link">
            <a
              href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
              target="_blank"
              rel="noreferrer"
            >
              Read documentation here
            </a>
          </FAQLink>

          <BGWhitelist>
            Whitelist Developers
            <div className="adress-list">{whitelistDev ? <TzAddress tzAddress={whitelistDev} hasIcon /> : '-'}</div>
          </BGWhitelist>
          <div className="line"></div>
        </BGInfo>
      </BGTop>

      <BGMiddleWrapper>
        <BGPrimaryTitle>Contract Status</BGPrimaryTitle>
        <div className="buttons-selector">
          {uniqueContracts.map((item) => (
            <NewButton
              key={item}
              kind={NAV_SIMPLE}
              className={item === selectedContract ? 'active' : ''}
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
      </BGCardsWrapper>

      <Pagination itemsCount={filteredBreakGlassStatuses.length} listName={BREAK_GLASS_LIST_NAME} />
    </BGStyled>
  )
}
