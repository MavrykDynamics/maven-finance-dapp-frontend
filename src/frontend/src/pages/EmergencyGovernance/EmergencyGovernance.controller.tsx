import { useLocation } from 'react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'

// view
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { EmergencyGovProposalModal } from './EmergencyGovProposalModal/EmergencyGovProposalModal'
import Button from 'app/App.components/Button/NewButton'
import { Page } from 'styles'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import Icon from 'app/App.components/Icon/Icon.view'
import { EGovCard } from './EGovCard/EGovCard.controller'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { EmptyContainer } from 'app/App.style'
import {
  CardContent,
  CardContentLeftSide,
  CardContentRightSide,
  EmergencyGovernanceCard,
  EmergencyGovernHistory,
} from './EmergencyGovernance.style'

// hooks
import { useDoormanContext } from 'providers/DoormanProvider/doorman.provider'
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'
import { useEGovContext } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { DAPP_MVK_SMVK_STATS_SUB, DEFAULT_STAKING_ACTIVE_SUBS } from 'providers/DoormanProvider/helpers/doorman.consts'
import {
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
} from 'providers/ContractStatuses/helpers/contractStatuses.consts'
import {
  DEFAULT_EGOV_SUBS,
  EGOV_CONFIG_SUB,
  EGOV_PROPOSALS_ALL_SUB,
  EGOV_PROPOSALS_SUB,
} from 'providers/EmergencyGovernanceProvider/helpers/eGov.consts'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import {
  calculateSlicePositions,
  EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME,
  getPageNumber,
} from 'app/App.components/Pagination/pagination.consts'

export const EmergencyGovernance = () => {
  const { search } = useLocation()

  const { userAddress } = useUserContext()
  const { changeStakingSubscriptionsList, isLoading: isDoormanLoading } = useDoormanContext()
  const {
    isLoading: isContractStatusConfigLoading,
    config: { isGlassBroken },
    changeContractStatusesSubscriptionsList,
  } = useContractStatusesContext()
  const {
    isLoading: isEgovLoading,
    changeEGovSubscriptionsList,
    pastProposals,
    proposalsMapper,
    ongoingProposals,
  } = useEGovContext()

  const [showInitiatePopup, setShowInitiatePopup] = useState(false)

  useEffect(() => {
    changeContractStatusesSubscriptionsList({
      [CONTRACT_STATUSES_CONFIG_SUB]: true,
    })
    changeStakingSubscriptionsList({
      [DAPP_MVK_SMVK_STATS_SUB]: true,
    })
    changeEGovSubscriptionsList({
      [EGOV_CONFIG_SUB]: true,
      [EGOV_PROPOSALS_SUB]: EGOV_PROPOSALS_ALL_SUB,
    })

    return () => {
      changeStakingSubscriptionsList(DEFAULT_STAKING_ACTIVE_SUBS)
      changeContractStatusesSubscriptionsList(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)
      changeEGovSubscriptionsList(DEFAULT_EGOV_SUBS)
    }
  }, [])

  const closeInitiatePopup = useCallback(() => setShowInitiatePopup(false), [])
  const openInitiatePopup = useCallback(() => setShowInitiatePopup(true), [])

  const currentPageHistory = getPageNumber(search, EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME)

  const paginatedPastProposals = useMemo(() => {
    const [from, to] = calculateSlicePositions(currentPageHistory, EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME)
    return pastProposals.slice(from, to)
  }, [currentPageHistory, pastProposals])

  return (
    <Page>
      <PageHeader page={'emergency governance'} />
      {isEgovLoading || isDoormanLoading || isContractStatusConfigLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Emergency Governance</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <EmergencyGovProposalModal show={showInitiatePopup} closeHandler={closeInitiatePopup} />
          <EmergencyGovernanceCard>
            <h2>What is it?</h2>
            <div>
              Handles the event of fatal flaw discovered → hold an emergency governance vote to pause all entrypoints in
              main contracts and pass access to the break glass contract where further actions will be determined by the
              break glass council members using a multi-sig.
            </div>
            <a
              href="https://docs.mavryk.finance/mavryk-finance/governance/emergency-governance"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Read documentation here
            </a>
          </EmergencyGovernanceCard>
          {ongoingProposals.length ? (
            ongoingProposals.map((proposalId) => {
              const proposal = proposalsMapper[proposalId]
              return <EGovCard key={proposalId} proposal={proposal} />
            })
          ) : (
            <EmergencyGovernanceCard>
              <a
                className="info-link"
                href="https://mavryk.finance/litepaper#emergency-governance--break-glass "
                target="_blank"
                rel="noreferrer"
              >
                <Icon id="question" />
              </a>
              <CardContent>
                <CardContentLeftSide>
                  <h2>Trigger Emergency Governance Vote</h2>
                  <div>
                    Initiate an Emergency Governance vote to break the glass by using the button on the right. Any user
                    can trigger this system by initiating an emergency governance action, detailing the cause for the
                    emergency vote in a form for the ecosystem to understand the urgency. In order to reduce spam, there
                    is a 10 XTZ fee paid to the Treasury.
                  </div>
                </CardContentLeftSide>
                <CardContentRightSide>
                  {userAddress ? (
                    <div className="initiateEgovProposal-button">
                      <Button
                        kind={BUTTON_PRIMARY}
                        onClick={openInitiatePopup}
                        form={BUTTON_WIDE}
                        disabled={isGlassBroken}
                      >
                        <Icon id="auction" /> Initiate
                      </Button>
                    </div>
                  ) : (
                    <ConnectWalletBtn isWide />
                  )}
                </CardContentRightSide>
              </CardContent>
            </EmergencyGovernanceCard>
          )}

          <EmergencyGovernHistory>
            <h1>Emergency Governance History</h1>
            {pastProposals.length ? (
              <>
                {paginatedPastProposals.map((proposalId) => {
                  const proposal = proposalsMapper[proposalId]
                  return <EGovCard key={proposalId} proposal={proposal} />
                })}

                <Pagination itemsCount={pastProposals.length} listName={EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME} />
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
      )}
    </Page>
  )
}
