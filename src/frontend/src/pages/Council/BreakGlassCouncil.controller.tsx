import { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'

// utils
import { propagateBreakGlass } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { parseCounsilTab } from './helpers/commonCouncil.utils'

// hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { useEGovContext } from 'providers/EmergencyGovernanceProvider/emergencyGovernance.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import {
  ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_BG_PAST_COUNCIL_ACTIONS_SUB,
  BG_COUNCIL_ACTIONS_DATA,
  BG_COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  MY_BG_PAST_COUNCIL_ACTIONS_SUB,
  PROPAGATE_BREAK_GLASS_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'
import { DEFAULT_EGOV_SUBS, EGOV_CONFIG_SUB } from 'providers/EmergencyGovernanceProvider/helpers/eGov.consts'
import { ALL_PAST_COUNSIL_TAB, ALL_PENDING_COUNSIL_TAB, MY_PENDING_COUNSIL_TAB } from './helpers/council.consts'

// view
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from './Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PropagateBreakGlassCouncilCard } from 'pages/Council/Council.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'

// TODO: validate tab in url?
export const BreakGlassCouncil = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const { bug } = useToasterContext()
  const {
    contractAddresses: { breakGlassAddress },
    globalLoadingState: { isActionActive },
    dappContracts,
  } = useDappConfigContext()
  const {
    userAddress,
    isBreakGlassCouncil,
    userAvatars: { breakGlassAvatar },
  } = useUserContext()
  const {
    isLoading: isBreakGlassCounsilLoading,
    changeCouncilSubscriptionList,
    breakGlassCouncilMembers,
    breakGlassCouncilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
  } = useCouncilContext()

  const {
    changeEGovSubscriptionsList,
    config: { emergencyGovActive },
    isLoading: isEGovLoading,
  } = useEGovContext()

  useEffect(() => {
    changeEGovSubscriptionsList({
      [EGOV_CONFIG_SUB]: true,
    })

    return () => {
      changeCouncilSubscriptionList(DEFAULT_COUNCIL_ACTIVE_SUBS)
      changeEGovSubscriptionsList(DEFAULT_EGOV_SUBS)
    }
  }, [])

  const selectedTab = useMemo(() => parseCounsilTab(tabId), [tabId])

  useEffect(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNSIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNSIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNSIL_TAB

    changeCouncilSubscriptionList({
      [BG_COUNCIL_MEMBERS_SUB]: true,
      // if my ongoing or all ongoing load all ongoing, if my past load my past, otherwise load all past
      [BG_COUNCIL_ACTIONS_DATA]:
        isMyPendingTab || isAllPendingTab
          ? ALL_BG_ONGOING_COUNCIL_ACTIONS_SUB
          : isAllPastTab
          ? ALL_BG_PAST_COUNCIL_ACTIONS_SUB
          : MY_BG_PAST_COUNCIL_ACTIONS_SUB,
    })
  }, [selectedTab])

  // propagate bg action -----------------------------------------------------------------------
  const propagateBreakGlassAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!breakGlassAddress) {
      bug('Wrong breakGlass address')
      return null
    }

    return await propagateBreakGlass(
      breakGlassAddress,
      dappContracts.map(({ address }) => address),
    )
  }, [userAddress, breakGlassAddress, bug, dappContracts])

  const propagateBreakGlassContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROPAGATE_BREAK_GLASS_ACTION,
      actionFn: propagateBreakGlassAction,
    }),
    [propagateBreakGlassAction],
  )

  const { action: handleClickPropagateBreakGlass } = useContractAction(propagateBreakGlassContractActionProps)

  return (
    <Page>
      <PageHeader page={'break glass council'} avatar={breakGlassAvatar} />

      {isBreakGlassCounsilLoading || isEGovLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Break Glass Counsil Data</div>
        </DataLoaderWrapper>
      ) : (
        <>
          {!tabId && isBreakGlassCouncil && (
            <PropagateBreakGlassCouncilCard>
              <div>
                <h1>Propagate Break Glass</h1>
                <p>
                  This action can only be taken to pause all contracts in the event of a successful emergency governance
                  where a critical flaw has been detected in the Mavryk Smart Contracts.
                </p>
              </div>

              {/*  TODO: clarify disabled this field with @CasualJackie & @Sam-M-Israel */}
              <NewButton
                kind={BUTTON_PRIMARY}
                onClick={handleClickPropagateBreakGlass}
                disabled={!emergencyGovActive || isActionActive}
              >
                <Icon id="plus" />
                Propagate Break Glass
              </NewButton>
            </PropagateBreakGlassCouncilCard>
          )}
          <CouncilView
            isBreakGlassCounsil
            allPendingActions={allPendingActions}
            notMyPendingActions={notMyPendingActions}
            myPendingActions={myPendingActions}
            allPastActions={allPastActions}
            myPastActions={myPastActions}
            actionsMapper={actionsMapper}
            members={breakGlassCouncilMembers}
            selectedTab={selectedTab}
          />
        </>
      )}
    </Page>
  )
}
