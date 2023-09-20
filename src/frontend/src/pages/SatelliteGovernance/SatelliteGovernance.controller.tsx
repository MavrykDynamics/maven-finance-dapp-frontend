import { useCallback, useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useLocation, useParams, useHistory } from 'react-router'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useSatelliteGovernanceContext } from 'providers/SatellitesGovernanceProvider/satelliteGovernance.provider'

// const
import {
  ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  MY_ACTIONS_SATELLITE_GOVERNANCE_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import {
  SATELLITE_GOVERNANCE_ACTIONS,
  SATELLITE_GOVERNANCE_MENU_TABS,
  SATELLITE_GOVERNANCE_PATHNAME,
} from './SatelliteGovernance.consts'
import { TAB_ID_ONGOING, TabIdType, getSatelliteGovSub } from './utils/tabsHelper'
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import { TOTAL_DELEGATED_MVK } from 'texts/tooltips/satellite'
import {
  DEFAULT_SATELLITE_GOVERNANCE_SUBS,
  SATELLITES_GOVERNANCE_CONFIG_SUB,
  SATELLITE_GOV_ACTIONS_DATA,
} from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'

// style
import {
  SatelliteGovernanceAvailableActions,
  SatelliteGovernanceStats,
  SatelliteGovernanceStyled,
  SatelliteGovernanceStatsInfo,
  SatelliteGovernanceMenuCards,
} from './SatelliteGovernance.style'
import { EmptyContainer } from '../../app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { H2SimpleTitle } from 'styles/generalStyledComponents/Titles.style'
import colors from 'styles/colors'

// helpers
import { convertBytesAddressToAddress } from '../../app/App.helpers'
import { calculateSlicePositions, getPageNumber } from 'app/App.components/Pagination/pagination.consts'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import {
  SlidingTabButtons,
  SlidingTabButtonType,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

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

  const { totalDelegatedMVK, totalActiveSatellites, totalOracleNetworks } = useSatelliteStatistics()
  const {
    preferences: { themeSelected },
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
            <h3>Total Delegated MVK</h3>
            <div className="value">
              <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
              <CustomTooltip
                iconId="info"
                text={TOTAL_DELEGATED_MVK}
                defaultStrokeColor={colors[themeSelected].primaryText}
              />
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
                        satelliteId={convertBytesAddressToAddress(action.parameters[0].value)}
                        initiatorId={action.initiatorId}
                        actionExpirationDate={action.expirationDatetime}
                        actionDroppedDate={action.droppedTime}
                        actionStartDate={action.startDatetime}
                        statusFlag={action.statusFlag}
                        purpose={action.purpose}
                        governanceType={action.type}
                        snapshotSmvkTotalSupply={action.snapshotSmvkTotalSupply}
                        smvkPercentageForApproval={action.smvkPercentageForApproval}
                        yayVotesSmvkTotal={action.yayVoteSmvkTotal}
                        nayVotesSmvkTotal={action.nayVoteSmvkTotal}
                        passVoteSmvkTotal={action.passVoteSmvkTotal}
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
