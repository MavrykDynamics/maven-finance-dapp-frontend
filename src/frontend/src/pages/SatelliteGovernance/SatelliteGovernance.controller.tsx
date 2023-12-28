import { useCallback, useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useHistory, useLocation, useParams } from 'react-router'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatelliteGovernanceContext } from 'providers/SatelliteGovernanceProvider/satelliteGovernance.provider'

// const
import {
  MY_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import {
  SATELLITE_GOVERNANCE_ACTIONS,
  SATELLITE_GOVERNANCE_MENU_TABS,
  SATELLITE_GOVERNANCE_PATHNAME,
} from './SatelliteGovernance.consts'
import { getSatelliteGovSub, TAB_ID_ONGOING, TabIdType } from './utils/tabsHelper'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import { TOTAL_DELEGATED_MVN } from 'texts/tooltips/satellite'
import {
  DEFAULT_SATELLITE_GOVERNANCE_SUBS,
  SATELLITE_GOV_ACTIONS_DATA,
  SATELLITES_GOVERNANCE_CONFIG_SUB,
} from 'providers/SatelliteGovernanceProvider/helpers/satellitesGov.consts'

// style
import {
  SatelliteGovernanceAvailableActions,
  SatelliteGovernanceMenuCards,
  SatelliteGovernanceStats,
  SatelliteGovernanceStatsInfo,
  SatelliteGovernanceStyled,
} from './SatelliteGovernance.style'
import { EmptyContainer } from '../../app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { H2SimpleTitle } from 'styles/generalStyledComponents/Titles.style'

// helpers
import { calculateSlicePositions, getPageNumber } from 'app/App.components/Pagination/pagination.consts'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { BYTES_ADDRESS_TYPE, convertBytes } from 'utils/convertBytes'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import Icon from 'app/App.components/Icon/Icon.view'

const getCurrentListNameById = (tabId: string) => {
  switch (tabId) {
    case SATELLITE_GOVERNANCE_MENU_TABS.ONGOING:
      return ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case SATELLITE_GOVERNANCE_MENU_TABS.PAST:
      return PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case SATELLITE_GOVERNANCE_MENU_TABS.MY:
      return MY_ACTIONS_SATELLITE_GOVERNANCE_LIST

    default:
      return ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST
  }
}

const emptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt="No proposals to show" />
    <figcaption>No actions to show</figcaption>
  </EmptyContainer>
)

export const SatelliteGovernance = () => {
  const { search } = useLocation()
  const history = useHistory()

  const { tabId = SATELLITE_GOVERNANCE_MENU_TABS.ONGOING } = useParams<{ tabId: TabIdType }>()

  const { totalDelegatedMVN, totalActiveSatellites, totalOracleNetworks } = useSatelliteStatistics()
  const {
    maxLengths: {
      governanceSatellite: { purposeMaxLength },
      dataFeeds: { feedNameMaxLength },
    },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { userAddress, isSatellite, govActionsCount } = useUserContext()

  const {
    isLoading,
    config: { maxActionsCount },
    ongoingSatelliteGovIds,
    pastSatelliteGovIds,
    mySatelliteGovIds,
    satelliteGovIdsMapper,
    changeSatelliteGovSubscriptionsList,
  } = useSatelliteGovernanceContext()

  // subs
  useEffect(() => {
    const subType = getSatelliteGovSub(tabId)

    if (subType !== null) {
      changeSatelliteGovSubscriptionsList({
        [SATELLITES_GOVERNANCE_CONFIG_SUB]: true,
        [SATELLITE_GOV_ACTIONS_DATA]: subType,
      })
    } else {
      history.push(`/satellite-governance/${TAB_ID_ONGOING}`)
    }

    return () => {
      changeSatelliteGovSubscriptionsList(DEFAULT_SATELLITE_GOVERNANCE_SUBS)
    }
  }, [tabId])

  const dropDownItems = useMemo(() => SATELLITE_GOVERNANCE_ACTIONS.map((item) => getDdItem(item)), [])
  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  // TODO: add same logic as in vaults, for nulling "my actions list", when user sign out
  const tabsList = useMemo<SlidingTabButtonType[]>(() => {
    return [
      {
        text: 'Ongoing Actions',
        id: 1,
        active: SATELLITE_GOVERNANCE_MENU_TABS.ONGOING === tabId,
        path: SATELLITE_GOVERNANCE_MENU_TABS.ONGOING,
      },
      {
        text: 'Past Actions',
        id: 2,
        active: SATELLITE_GOVERNANCE_MENU_TABS.PAST === tabId,
        path: SATELLITE_GOVERNANCE_MENU_TABS.PAST,
      },
      {
        text: 'My Actions',
        id: 3,
        active: SATELLITE_GOVERNANCE_MENU_TABS.MY === tabId,
        path: SATELLITE_GOVERNANCE_MENU_TABS.MY,
      },
    ]
  }, [tabId])

  const ongoingActionsLength = ongoingSatelliteGovIds.length

  const maxLength = {
    purposeMaxLength,
    aggregatorNameMaxLength: feedNameMaxLength,
  }

  const getCurrentIdsById = useCallback(
    (tabId: string) => {
      switch (tabId) {
        case SATELLITE_GOVERNANCE_MENU_TABS.ONGOING:
          return ongoingSatelliteGovIds
        case SATELLITE_GOVERNANCE_MENU_TABS.PAST:
          return pastSatelliteGovIds
        case SATELLITE_GOVERNANCE_MENU_TABS.MY:
          return mySatelliteGovIds

        default:
          return ongoingSatelliteGovIds
      }
    },
    [mySatelliteGovIds, ongoingSatelliteGovIds, pastSatelliteGovIds],
  )

  const currentListName = getCurrentListNameById(tabId)
  const currentSatelliteGovIds = getCurrentIdsById(tabId)
  const currentPage = getPageNumber(search, currentListName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return currentSatelliteGovIds?.slice(from, to)
  }, [currentListName, currentPage, currentSatelliteGovIds])

  const handleChangeTabs = (id: number) => {
    const foundTab = tabsList.find((item) => item.id === id)
    const currentTabId = tabsList.find((item) => item.path === tabId)?.id

    if (!foundTab?.path || currentTabId === id) return
    history.replace(`${SATELLITE_GOVERNANCE_PATHNAME}/${foundTab.path}`)
  }

  const handleClickDropdownItem = (itemId: DDItemId) => {
    const foundItem = dropDownItems.find((item) => item.id === itemId)

    if (!foundItem) return
    setChosenDdItem(foundItem)
  }

  return (
    <Page>
      <PageHeader page={'satellite-governance'} />

      <SatelliteGovernanceStyled>
        <SatelliteGovernanceStats>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Active Satellites</h3>
            <div className="value">{totalActiveSatellites}</div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Oracle Networks</h3>
            <div className="value">{totalOracleNetworks}</div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Delegated MVN</h3>
            <div className="value">
              <CommaNumber value={totalDelegatedMVN} endingText={'MVN'} />
              <Tooltip>
                <Tooltip.Trigger className="ml-3 mt-3 tooltip-trigger">
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>{TOTAL_DELEGATED_MVN}</Tooltip.Content>
              </Tooltip>
            </div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Ongoing Actions</h3>
            <div className="value">{ongoingActionsLength}</div>
          </SatelliteGovernanceStatsInfo>
        </SatelliteGovernanceStats>

        {isSatellite ? (
          <SatelliteGovernanceAvailableActions>
            <div className="navigation">
              <H2SimpleTitle>Available Actions</H2SimpleTitle>
              <span>
                {govActionsCount} from {maxActionsCount}
              </span>

              <DropDown
                placeholder="Choose action"
                activeItem={chosenDdItem}
                items={dropDownItems}
                clickItem={handleClickDropdownItem}
              />
            </div>

            <SatelliteGovernanceForm
              maxLength={maxLength}
              isButtonDisabled={isActionActive || govActionsCount >= maxActionsCount}
              variant={chosenDdItem?.id}
            />
          </SatelliteGovernanceAvailableActions>
        ) : null}

        {isLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading satellite governance actions</div>
          </DataLoaderWrapper>
        ) : (
          <SatelliteGovernanceMenuCards>
            <SlidingTabButtons kind={SECONDARY_SLIDING_TAB_BUTTONS} tabItems={tabsList} onClick={handleChangeTabs} />

            <div>
              {paginatedItemsList.length
                ? paginatedItemsList.map((itemId) => {
                    const action = satelliteGovIdsMapper[itemId]

                    return (
                      <SatelliteGovernanceCard
                        key={`${action.id}`}
                        id={action.id}
                        satelliteId={convertBytes(action.parameters[0].value, BYTES_ADDRESS_TYPE)}
                        initiatorId={action.initiatorId}
                        actionExpirationDate={action.expirationDatetime}
                        actionDroppedDate={action.droppedTime}
                        actionStartDate={action.startDatetime}
                        statusFlag={action.statusFlag}
                        purpose={action.purpose}
                        governanceType={action.type}
                        snapshotSmvnTotalSupply={action.snapshotSmvnTotalSupply}
                        smvnPercentageForApproval={action.smvnPercentageForApproval}
                        yayVotesSmvnTotal={action.yayVotesSmvnTotal}
                        nayVotesSmvnTotal={action.nayVotesSmvnTotal}
                        passVoteSmvnTotal={action.passVotesSmvnTotal}
                        accountPkh={userAddress}
                        isActionActive={isActionActive}
                        votes={action.votes}
                      />
                    )
                  })
                : emptyContainer}

              <Pagination itemsCount={currentSatelliteGovIds.length} listName={currentListName} />
            </div>
          </SatelliteGovernanceMenuCards>
        )}
      </SatelliteGovernanceStyled>
    </Page>
  )
}

export default SatelliteGovernance
