import { useMemo } from 'react'

// actions, consts
import {
  calculateSlicePositions,
  EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME,
  getPageNumber,
} from 'app/Pagination/pagination.consts'

// types
import type {
  EmergencyGovernanceStorage,
  EmergergencyGovernanceItem,
} from '../../utils/TypesAndInterfaces/EmergencyGovernance'

// components
import Icon from '../../app/App.components/Icon/Icon.view'

import { ACTION_PRIMARY } from '../../app/App.components/Button/Button.constants'
import { Button } from '../../app/App.components/Button/Button.controller'
import { ConnectWallet } from '../../app/App.components/ConnectWallet/ConnectWallet.controller'
import { EGovCard } from './EGovCard/EGovCard.controller'
import {
  CardContent,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernanceCard,
  EmergencyGovernHistory,
} from './EmergencyGovernance.style'

import Pagination from 'app/Pagination/Pagination.view'
import { useLocation } from 'react-router'
import { EmptyContainer } from 'app/App.style'

type Props = {
  accountPkh?: string
  handleTriggerEmergencyProposal: () => void
  emergencyGovernanceLedger: EmergencyGovernanceStorage['emergencyGovernanceLedger']
  isGlassBroken: boolean
}

export const EmergencyGovernanceView = ({
  accountPkh,
  handleTriggerEmergencyProposal,
  emergencyGovernanceLedger,
  isGlassBroken,
}: Props) => {
  const { historyItems, activeItems } = useMemo(
    () =>
      emergencyGovernanceLedger.reduce<{
        historyItems: Array<EmergergencyGovernanceItem>
        activeItems: Array<EmergergencyGovernanceItem>
      }>(
        (acc, eGovItem) => {
          const isExecutedDateTime = eGovItem.expirationTimestamp < Date.now()
          if (isExecutedDateTime || eGovItem.executed || eGovItem.dropped) {
            acc.historyItems.push(eGovItem)
          } else {
            acc.activeItems.push(eGovItem)
          }
          return acc
        },
        { historyItems: [], activeItems: [] },
      ),
    [emergencyGovernanceLedger],
  )

  const { search } = useLocation()
  const currentPageHistory = getPageNumber(search, EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME)

  const paginatedItemsListHistory = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPageHistory, EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME)
    return historyItems.slice(from, to)
  }, [currentPageHistory, historyItems])

  return (
    <>
      <EmergencyGovernanceCard>
        <h2>What is it?</h2>
        <div>
          Handles the event of fatal flaw discovered → hold an emergency governance vote to pause all entrypoints in
          main contracts and pass access to the break glass contract where further actions will be determined by the
          break glass council members using a multi-sig.
        </div>
        <a
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          Read documentation here
        </a>
      </EmergencyGovernanceCard>

      <EmergencyGovernanceCard>
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
        <CardContent>
          <CardContentLeftSide>
            <h2>Trigger Emergency Governance Vote</h2>
            <div>
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
              Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
              galley of type and scrambled it to make.
            </div>
          </CardContentLeftSide>
          <CardContentRightSide>
            {accountPkh ? (
              <Button
                text={'Initiate'}
                kind={ACTION_PRIMARY}
                icon={'auction'}
                onClick={handleTriggerEmergencyProposal}
                disabled={isGlassBroken || activeItems.length !== 0}
              />
            ) : (
              <ConnectWallet className="connect-wallet" />
            )}
          </CardContentRightSide>
        </CardContent>
      </EmergencyGovernanceCard>

      {activeItems.length
        ? activeItems.map((emergencyGovernance) => {
            return <EGovCard key={emergencyGovernance.id} emergencyGovernance={emergencyGovernance} />
          })
        : null}

      <EmergencyGovernHistory>
        <h1>Emergency Governance History</h1>
        {paginatedItemsListHistory.length ? (
          <>
            {paginatedItemsListHistory.map((emergencyGovernance) => {
              return <EGovCard key={emergencyGovernance.id} emergencyGovernance={emergencyGovernance} />
            })}

            <Pagination itemsCount={historyItems.length} listName={EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME} />
          </>
        ) : (
          <EmptyContainer
            style={{
              paddingTop: '80px',
            }}
          >
            <img src="/images/not-found.svg" alt=" No emergency history to show" />
            <figcaption> No items to show</figcaption>
          </EmptyContainer>
        )}
      </EmergencyGovernHistory>
    </>
  )
}
