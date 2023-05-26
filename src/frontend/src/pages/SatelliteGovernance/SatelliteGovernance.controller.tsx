import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation, useParams, useHistory } from 'react-router'

// const
import { calculateSlicePositions, getPageNumber } from 'app/App.components/Pagination/pagination.consts'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DDItemId, DropDown, getDdItem } from 'app/App.components/DropDown/NewDropdown'
import { FixMistakenTransferForm } from './FixMistakenTransfer.form'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { RegisterAggregatorForm } from './RegisterAggregator.form'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// actions
import { getSatelliteGovernanceStorage } from './SatelliteGovernance.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/helpers/Satellites.consts'

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

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { convertBytesAddressToAddress } from '../../app/App.helpers'
import {
  ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  MY_ACTIONS_SATELLITE_GOVERNANCE_LIST,
} from '../../app/App.components/Pagination/pagination.consts'
import { TabSwitcher } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { H2SimpleTitle } from 'styles/generalStyledComponents/Titles.style'

const itemsForDropDown = [
  'Suspend Satellite',
  'Unsuspend Satellite',
  'Ban Satellite',
  'Unban Satellite',
  'Remove Oracles',
  'Remove from Aggregator',
  'Add to Aggregator',
  'Restore Satellite',
  // TODO: commented according to [MAV-1404]
  // 'Set Aggregator Maintainer',
  // 'Update Aggregator Status',
  // 'Register Aggregator',
  'Fix Mistaken Transfer',
]

const tabsId = {
  ONGOING: 'ongoing',
  PAST: 'past',
  MY: 'my',
}

const satelliteGovPathname = '/satellite-governance'

const getCurrentListNameById = (tabId: string) => {
  switch (tabId) {
    case tabsId.ONGOING:
      return ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case tabsId.PAST:
      return PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST
    case tabsId.MY:
      return MY_ACTIONS_SATELLITE_GOVERNANCE_LIST

    default:
      return ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST
  }
}

export const SatelliteGovernance = () => {
  const { search } = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()

  const { tabId = tabsId.ONGOING } = useParams<{ tabId: string }>()

  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)

  const {
    isLoaded,
    ongoingSatelliteGovIds,
    pastSatelliteGovIds,
    mySatelliteGovIds,
    satelliteGovIdsMapper,
    config: { purposeMaxLength },
  } = useSelector((state: State) => state.satelliteGovernance)

  const { oraclesIds, activeSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)
  const { feedNameMaxLength } = useSelector((state: State) => state.dataFeeds.config)
  const { isActionActive } = useSelector((state: State) => state.loading)

  const dropDownItems = useMemo(() => itemsForDropDown.map((item) => getDdItem(item)), [])
  type DropDownItemType = (typeof dropDownItems)[0]

  const [chosenDdItem, setChosenDdItem] = useState<DropDownItemType | undefined>()
  const [tabsList, setTabsList] = useState<TabItem[]>([])

  const totalDelegatedMVK = getTotalDelegatedMVK(activeSatellitesIds, satelliteMapper)
  const ongoingActionsAmount = ongoingSatelliteGovIds.length

  const maxLength = {
    purposeMaxLength,
    aggregatorNameMaxLength: feedNameMaxLength,
  }

  const getCurrentIdsById = useCallback(
    (tabId: string) => {
      switch (tabId) {
        case tabsId.ONGOING:
          return ongoingSatelliteGovIds
        case tabsId.PAST:
          return pastSatelliteGovIds
        case tabsId.MY:
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
    history.replace(`${satelliteGovPathname}/${foundTab.path}`)
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
    [accountPkh],
  )

  // set tabs list
  useEffect(() => {
    const prevTabs = [
      {
        text: 'Ongoing Actions',
        id: 1,
        active: tabsId.ONGOING === tabId,
        path: tabsId.ONGOING,
      },
      {
        text: 'Past Actions',
        id: 2,
        active: tabsId.PAST === tabId,
        path: tabsId.PAST,
      },
    ]

    if (isSatellite) {
      setTabsList([
        ...prevTabs,
        {
          text: 'My Actions',
          id: 3,
          active: tabsId.MY === tabId,
          path: tabsId.MY,
          isDisabled: !accountPkh,
        },
      ])
    } else {
      setTabsList([...prevTabs])
    }
  }, [accountPkh, isSatellite, tabId])

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt="No proposals to show" />
      <figcaption>No actions to show</figcaption>
    </EmptyContainer>
  )

  return (
    <Page>
      <PageHeader page={'satellite-governance'} />

      <SatelliteGovernanceStyled>
        <SatelliteGovernanceStats>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Active Satellites</h3>
            <div className="value">{activeSatellitesIds.length}</div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Oracle Networks</h3>
            <div className="value">{oraclesIds.length}</div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Total Delegated MVK</h3>
            <div className="value">
              <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
              <CustomTooltip iconId="info" text="All staked MVK that is delegated to satellites by users" />
            </div>
          </SatelliteGovernanceStatsInfo>
          <SatelliteGovernanceStatsInfo>
            <h3>Ongoing Actions</h3>
            <div className="value">{ongoingActionsAmount}</div>
          </SatelliteGovernanceStatsInfo>
        </SatelliteGovernanceStats>

        {isSatellite ? (
          <SatelliteGovernanceAvailableActions>
            <div className="navigation">
              <H2SimpleTitle>Available Actions</H2SimpleTitle>

              <DropDown
                placeholder="Choose action"
                activeItem={chosenDdItem}
                items={dropDownItems}
                clickItem={handleClickDropdownItem}
              />
            </div>

            {chosenDdItem?.id === 'Register Aggregator' ? (
              <RegisterAggregatorForm maxLength={maxLength} isActionActive={isActionActive} />
            ) : chosenDdItem?.id === 'Fix Mistaken Transfer' ? (
              <FixMistakenTransferForm maxLength={maxLength} isActionActive={isActionActive} />
            ) : (
              <SatelliteGovernanceForm
                maxLength={maxLength}
                isActionActive={isActionActive}
                variant={chosenDdItem?.id ?? ''}
              />
            )}
          </SatelliteGovernanceAvailableActions>
        ) : null}

        {isLoading ? (
          <DataLoaderWrapper>
            <ClockLoader width={150} height={150} />
            <div className="text">Loading vaults</div>
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
                        date={action.expirationDatetime}
                        executed={action.executed}
                        status={action.status}
                        statusFlag={action.statusFlag}
                        purpose={action.purpose}
                        governanceType={action.type}
                        snapshotSmvkTotalSupply={action.snapshotSmvkTotalSupply}
                        smvkPercentageForApproval={action.smvkPercentageForApproval}
                        yayVotesSmvkTotal={action.yayVoteSmvkTotal}
                        nayVotesSmvkTotal={action.nayVoteSmvkTotal}
                        passVoteSmvkTotal={action.passVoteSmvkTotal}
                        accountPkh={accountPkh}
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
