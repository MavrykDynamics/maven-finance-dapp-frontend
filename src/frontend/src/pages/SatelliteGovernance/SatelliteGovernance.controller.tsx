import React, { useCallback, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation, useParams, useHistory } from 'react-router'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// const
import { calculateSlicePositions, getPageNumber } from 'app/App.components/Pagination/pagination.consts'

// actions

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

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { convertBytesAddressToAddress } from '../../app/App.helpers'
import {
  ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  MY_ACTIONS_SATELLITE_GOVERNANCE_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import { useSatelliteStatistics } from 'providers/SatellitesProvider/hooks/useSatelliteStatistics'
import {
  SATELLITE_GOVERNANCE_ACTIONS,
  SATELLITE_GOVERNANCE_MENU_TABS,
  SATELLITE_GOVERNANCE_PATHNAME,
} from './SatelliteGovernance.consts'
import { TOTAL_DELEGATED_MVK } from 'texts/tooltips/satellite'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { getSatelliteGovernanceStorage } from './satelliteGovernance.storage'

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
  const dispatch = useDispatch()

  const { tabId = SATELLITE_GOVERNANCE_MENU_TABS.ONGOING } = useParams<{ tabId: string }>()

  const { totalDelegatedMVK, totalActiveSatellites, totalOracleNetworks } = useSatelliteStatistics({
    skipOracleRewardsTotal: true,
  })
  const {
    maxLengths: {
      governanceSatellite: { purposeMaxLength },
      dataFeeds: { feedNameMaxLength },
    },
  } = useDappConfigContext()
  const { userAddress, isSatellite, govActionsCount } = useUserContext()

  const { maxActionsCount } = useSelector((state: State) => state.satelliteGovernance.config)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const { isLoaded, ongoingSatelliteGovIds, pastSatelliteGovIds, mySatelliteGovIds, satelliteGovIdsMapper } =
    useSelector((state: State) => state.satelliteGovernance)

  const dropDownItems = useMemo(() => SATELLITE_GOVERNANCE_ACTIONS.map((item) => getDdItem(item)), [])
  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()

  // TODO: add same logic as in vaults, for nulling "my actions list", when user sign out
  const tabsList = useMemo<TabItem[]>(() => {
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

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isLoaded || isDepsChanged) {
          await dispatch(getSatelliteGovernanceStorage())
        }
      } catch (e) {}
    },
    [userAddress],
  )

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
              <CustomTooltip iconId="info" text={TOTAL_DELEGATED_MVK} />
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
              isActionActive={isActionActive || govActionsCount >= maxActionsCount}
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
            <TabSwitcher tabItems={tabsList} onClick={handleChangeTabs} className="primary-switcher" />

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
