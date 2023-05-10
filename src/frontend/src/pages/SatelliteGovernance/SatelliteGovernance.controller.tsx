import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'

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
import { TabItem } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { RegisterAggregatorForm } from './RegisterAggregator.form'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { Button } from 'app/App.components/Button/Button.controller'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// actions
import { getSatelliteGovernanceStorage } from './SatelliteGovernance.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/helpers/Satellites.consts'

// style
import { SatelliteGovernanceStyled, SmallInfoBlock } from './SatelliteGovernance.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'
import { EmptyContainer } from '../../app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import { convertBytesAddressToAddress } from '../../app/App.helpers'
import {
  ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST,
  MY_ACTIONS_SATELLITE_GOVERNANCE_LIST,
} from '../../app/App.components/Pagination/pagination.consts'

type ExtendedTabItem = TabItem & {
  path: string
}

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
  const dispatch = useDispatch()

  const { tabId = tabsId.ONGOING } = useParams<{ tabId: string }>()

  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)

  const { oraclesIds, activeSatellitesIds, satelliteMapper } = useSelector((state: State) => state.satellites)

  const { isActionActive } = useSelector((state: State) => state.loading)

  const {
    isLoaded,
    ongoingSatelliteGovIds,
    pastSatelliteGovIds,
    mySatelliteGovIds,
    satelliteGovIdsMapper,
    config: { purposeMaxLength },
  } = useSelector((state: State) => state.satelliteGovernance)

  const { feedNameMaxLength } = useSelector((state: State) => state.dataFeeds.config)

  const ddItems = useMemo(() => itemsForDropDown.map((item) => getDdItem(item)), [])

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

  const [tabsList, setTabsList] = useState<ExtendedTabItem[]>([])
  const [chosenDdItem, setChosenDdItem] = useState<string>()
  const activeDdItem = useMemo(() => (chosenDdItem ? getDdItem(chosenDdItem) : undefined), [chosenDdItem])

  const currentListName = getCurrentListNameById(tabId)
  const currentSatelliteGovIds = getCurrentIdsById(tabId)
  const currentPage = getPageNumber(search, currentListName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, currentListName)
    return currentSatelliteGovIds?.slice(from, to)
  }, [currentListName, currentPage, currentSatelliteGovIds])

  const totalDelegatedMVK = getTotalDelegatedMVK(activeSatellitesIds, satelliteMapper)
  const ongoingActionsAmount = ongoingSatelliteGovIds.length

  const maxLength = {
    purposeMaxLength,
    aggregatorNameMaxLength: feedNameMaxLength,
  }

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

  const handleOnClickDropdownItem = (itemId: DDItemId) => {
    const chosenItem = ddItems.find((item) => item.id === itemId)
    setChosenDdItem(chosenItem?.id)
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

  const emptyContainer = (
    <EmptyContainer>
      <img src="/images/not-found.svg" alt=" No proposals to show" />
      <figcaption> No actions to show</figcaption>
    </EmptyContainer>
  )

  return (
    <Page>
      <PageHeader page={'satellite-governance'} />

      <SatelliteGovernanceStyled>
        <article className="satellite-governance-article">
          <SmallInfoBlock>
            <h3>Total Active Satellites</h3>
            <div className="info-content">{activeSatellitesIds.length}</div>
          </SmallInfoBlock>
          <SmallInfoBlock>
            <h3>Total Oracle Networks</h3>
            <div className="info-content">{oraclesIds.length}</div>
          </SmallInfoBlock>
          <SmallInfoBlock>
            <h3>Total Delegated MVK</h3>
            <div className="info-content">
              <CommaNumber value={totalDelegatedMVK} endingText={'MVK'} />
              <CustomTooltip iconId="info" text="All staked MVK that is delegated to satellites by users" />
            </div>
          </SmallInfoBlock>
          <SmallInfoBlock>
            <h3>Ongoing Actions</h3>
            <div className="info-content">{ongoingActionsAmount}</div>
          </SmallInfoBlock>
        </article>

        {isSatellite ? (
          <DropdownCard className="satellite-governance-dropdown">
            <DropdownWrap>
              <h2>Available Actions</h2>

              <DropDown
                placeholder="Choose action"
                activeItem={activeDdItem}
                items={ddItems}
                clickItem={handleOnClickDropdownItem}
              />
            </DropdownWrap>
            {chosenDdItem === 'Register Aggregator' ? (
              <RegisterAggregatorForm maxLength={maxLength} isActionActive={isActionActive} />
            ) : chosenDdItem === 'Fix Mistaken Transfer' ? (
              <FixMistakenTransferForm maxLength={maxLength} isActionActive={isActionActive} />
            ) : (
              <SatelliteGovernanceForm
                maxLength={maxLength}
                isActionActive={isActionActive}
                variant={chosenDdItem || ''}
              />
            )}
          </DropdownCard>
        ) : null}

        {tabsList?.length ? (
          <div className="buttons-selector">
            {tabsList.map(({ text, active, path }) => (
              <Link key={path} to={`/satellite-governance/${path}`}>
                <Button kind={ACTION_SIMPLE} text={text} className={active ? 'active' : ''} />
              </Link>
            ))}
          </div>
        ) : null}
      </SatelliteGovernanceStyled>

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading vaults</div>
        </DataLoaderWrapper>
      ) : paginatedItemsList.length ? (
        paginatedItemsList.map((itemId) => {
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
      ) : (
        emptyContainer
      )}

      <Pagination itemsCount={currentSatelliteGovIds.length} listName={currentListName} />
    </Page>
  )
}

export default SatelliteGovernance
