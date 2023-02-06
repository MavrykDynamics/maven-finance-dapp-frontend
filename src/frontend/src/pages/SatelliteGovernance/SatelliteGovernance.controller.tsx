import React, { useEffect, useMemo, useState } from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLocation } from 'react-router'

// types
import type { GovernanceSatelliteActionGraphQL } from '../../utils/TypesAndInterfaces/Governance'

// const
import { getPageNumber } from 'pages/FinacialRequests/FinancialRequests.helpers'
import {
  calculateSlicePositions,
  getSatelliteGovernanceListName,
} from 'pages/FinacialRequests/Pagination/pagination.consts'
import { defaultGovPurposeMaxLength } from 'app/App.components/Input/Input.constants'
import { defaultAggregatorNameMaxLength } from 'app/App.components/Input/Input.constants'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DropDown } from '../../app/App.components/DropDown/DropDown.controller'
import { FixMistakenTransferForm } from './FixMistakenTransfer.form'
import { SatelliteGovernanceCard } from './SatelliteGovernanceCard/SatelliteGovernanceCard.controller'
import { SatelliteGovernanceForm } from './SatelliteGovernance.form'
import { CommaNumber } from '../../app/App.components/CommaNumber/CommaNumber.controller'
import Pagination from 'pages/FinacialRequests/Pagination/Pagination.view'
import { TabItem } from '../../app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { RegisterAggregatorForm } from './RegisterAggregator.form'

// actions
import { getGovernanceSatelliteStorage } from './SatelliteGovernance.actions'
import { getTotalDelegatedMVK } from 'pages/Satellites/helpers/Satellites.consts'

// style
import { SatelliteGovernanceStyled, SmallInfoBlock } from './SatelliteGovernance.style'
import { DropdownCard, DropdownWrap } from '../../app/App.components/DropDown/DropDown.style'
import { EmptyContainer } from '../../app/App.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { Button } from 'app/App.components/Button/Button.controller'
import { ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import {convertBytesAddressToAddress, convertBytesStringToText} from "../../app/App.helpers";

const itemsForDropDown = [
  'Suspend Satellite',
  'Unsuspend Satellite',
  'Ban Satellite',
  'Unban Satellite',
  'Remove Oracles',
  'Remove from Aggregator',
  'Add to Aggregator',
  'Restore Satellite',
  'Set Aggregator Maintainer',
  'Update Aggregator Status',
  'Register Aggregator',
  'Fix Mistaken Transfer',
]

const getOngoingActionsList = (list: GovernanceSatelliteActionGraphQL[]): GovernanceSatelliteActionGraphQL[] => {
  return list?.filter((item) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime as string).getTime()
    return expirationDatetime > timeNow && item.status !== 1 && !item.executed
  })
}

const getPastActionsList = (list: GovernanceSatelliteActionGraphQL[]): GovernanceSatelliteActionGraphQL[] => {
  return list?.filter((item) => {
    const timeNow = Date.now()
    const expirationDatetime = new Date(item.expiration_datetime as string).getTime()
    return expirationDatetime < timeNow
  })
}

export const SatelliteGovernance = () => {
  const { search } = useLocation()
  const dispatch = useDispatch()
  const {
    accountPkh,
    user: { isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    delegationStorage: { satelliteLedger, activeSatellites, oraclesAmount },
  } = useSelector((state: State) => state.delegation)
  const {
    governanceSatelliteStorage: { governance_satellite_action, governance_satellite },
  } = useSelector((state: State) => state.governance)
  const {
    oraclesStorage: { feedsFactory },
  } = useSelector((state: State) => state.oracles)

  const [ddIsOpen, setDdIsOpen] = useState(false)
  const [chosenDdItem, setChosenDdItem] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState(1)
  const [tabsList, setTabsList] = useState<TabItem[]>([])
  const [separateRecord, setSeparateRecord] = useState<GovernanceSatelliteActionGraphQL[]>([])

  useEffect(() => {
    ;(async () => {
      await dispatch(getGovernanceSatelliteStorage())
    })()
  }, [dispatch])

  const listName = useMemo(() => getSatelliteGovernanceListName(activeTab), [activeTab])
  const currentPage = getPageNumber(search, listName)

  const paginatedItemsList = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPage, listName)
    return separateRecord?.slice(from, to)
  }, [currentPage, separateRecord])

  const totalDelegatedMVK = getTotalDelegatedMVK(satelliteLedger)
  const ongoingActionsAmount = getOngoingActionsList(governance_satellite_action)?.length

  const maxLength = {
    purposeMaxLength: governance_satellite[0]?.gov_purpose_max_length || defaultGovPurposeMaxLength,
    aggregatorNameMaxLength: feedsFactory[0]?.aggregator_name_max_length || defaultAggregatorNameMaxLength,
  }

  useEffect(() => {
    const filterOngoing = getOngoingActionsList(governance_satellite_action)
    const filterPast = getPastActionsList(governance_satellite_action)

    setSeparateRecord(filterOngoing?.length ? filterOngoing : filterPast)
    setActiveTab(filterOngoing?.length ? 1 : 2)

    const prevTabs = [
      { text: 'Ongoing Actions', id: 1, active: Boolean(filterOngoing?.length) },
      { text: 'Past Actions', id: 2, active: Boolean(!filterOngoing?.length) },
    ]

    if (isSatellite) {
      setTabsList([...prevTabs, { text: 'My Actions', id: 3, active: false }])
    } else {
      setTabsList([...prevTabs])
    }
  }, [governance_satellite_action, isSatellite])

  const handleOnClickDropdownItem = (e: string) => {
    const chosenItem = itemsForDropDown.find((item) => item === e)
    if (chosenItem) {
      setChosenDdItem(chosenItem)
      setDdIsOpen(!ddIsOpen)
    }
  }

  const handleChangeTabs = (tabId?: number) => {
    if (tabId === 1) {
      setActiveTab(tabId)
      const filterOngoing = getOngoingActionsList(governance_satellite_action)
      setSeparateRecord(filterOngoing)
    }

    if (tabId === 2) {
      setActiveTab(tabId)
      const filterPast = getPastActionsList(governance_satellite_action)
      setSeparateRecord(filterPast)
    }

    if (tabId === 3) {
      setActiveTab(tabId)
      const filterPast = governance_satellite_action.filter((item) => {
        return accountPkh === item.initiator_id
      })
      setSeparateRecord(filterPast)
    }
  }

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
            <div className="info-content">{activeSatellites?.length}</div>
          </SmallInfoBlock>
          <SmallInfoBlock>
            <h3>Total Oracle Networks</h3>
            <div className="info-content">{oraclesAmount}</div>
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
                isOpen={ddIsOpen}
                setIsOpen={setDdIsOpen}
                itemSelected={chosenDdItem}
                items={itemsForDropDown}
                clickOnItem={(e) => handleOnClickDropdownItem(e)}
              />
            </DropdownWrap>
            {chosenDdItem === 'Register Aggregator' ? (
              <RegisterAggregatorForm maxLength={maxLength} />
            ) : chosenDdItem === 'Fix Mistaken Transfer' ? (
              <FixMistakenTransferForm maxLength={maxLength} />
            ) : (
              <SatelliteGovernanceForm maxLength={maxLength} variant={chosenDdItem || ''} />
            )}
          </DropdownCard>
        ) : null}
        {tabsList?.length ? (
          <div className="buttons-selector">
            {tabsList.map(({ id, text }) => (
              <Button
                kind={ACTION_SIMPLE}
                onClick={() => {
                  handleChangeTabs(id)
                }}
                text={text}
                className={id === activeTab ? 'active' : ''}
              />
            ))}
          </div>
        ) : null}
      </SatelliteGovernanceStyled>

      {paginatedItemsList?.length
        ? paginatedItemsList.map((item: GovernanceSatelliteActionGraphQL) => {
            return (
              <SatelliteGovernanceCard
                key={item.id}
                id={item.id}
                satelliteId={convertBytesAddressToAddress(item.parameters?.[0].value) ?? ''} // TODO: add parsing target address from bytes to tz1
                initiatorId={item.initiator_id}
                date={item.expiration_datetime || ''}
                executed={item.executed}
                status={item.status}
                purpose={item.governance_purpose}
                governanceType={item.governance_type}
                yayVotesSmvkTotal={item.yay_vote_smvk_total}
                nayVotesSmvkTotal={item.nay_vote_smvk_total}
                snapshotSmvkTotalSupply={item.snapshot_smvk_total_supply}
                passVoteSmvkTotal={item.pass_vote_smvk_total}
                smvkPercentageForApproval={item.smvk_percentage_for_approval}
                accountPkh={accountPkh}
              />
            )
          })
        : emptyContainer}

      <Pagination itemsCount={separateRecord?.length} listName={listName} />
    </Page>
  )
}

export default SatelliteGovernance
