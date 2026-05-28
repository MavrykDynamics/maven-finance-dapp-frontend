import { useCallback, useEffect, useMemo } from 'react'
import { useParams } from 'react-router'

// utils
import { propagateBreakGlass } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'
import { parseCouncilTab } from './helpers/commonCouncil.utils'

// hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction/useContractAction'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useContractStatusesContext } from 'providers/ContractStatuses/ContractStatuses.provider'

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
import {
  ALL_PAST_COUNCIL_TAB,
  ALL_PENDING_COUNCIL_TAB,
  MY_PENDING_COUNCIL_TAB,
  PROPAGATE_BREAK_GLASS_ACTION_FORM,
} from './helpers/council.consts'
import {
  CONTRACT_STATUSES_ALL_SUB,
  CONTRACT_STATUSES_CONFIG_SUB,
  DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS,
} from 'providers/ContractStatuses/helpers/contractStatuses.consts'

// view
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from './Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PropagateBreakGlassCouncilCard } from 'pages/Council/Council.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// TODO: validate tab in url?
export const BreakGlassCouncil = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const { bug } = useToasterContext()
  const {
    contractAddresses: { breakGlassAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const {
    userAddress,
    isBreakGlassCouncil,
    userAvatars: { breakGlassAvatar },
  } = useUserContext()
  const {
    isLoading: isBreakGlassCouncilLoading,
    changeCouncilSubscriptionList,
    breakGlassCouncilMembers,
    breakGlassCouncilActions: {
      allPendingActions,
      actionsToSign,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
  } = useCouncilContext()
  const {
    isLoading: isContractStatusesLoading,
    contractStatuses,
    config: { isGlassBroken },
    changeContractStatusesSubscriptionsList,
  } = useContractStatusesContext()

  useEffect(() => {
    changeContractStatusesSubscriptionsList({
      [CONTRACT_STATUSES_ALL_SUB]: true,
      [CONTRACT_STATUSES_CONFIG_SUB]: true,
    })

    return () => {
      changeCouncilSubscriptionList(DEFAULT_COUNCIL_ACTIVE_SUBS)
      changeContractStatusesSubscriptionsList(DEFAULT_CONTRACT_STATUSES_ACTIVE_SUBS)
    }
  }, [])

  const selectedTab = useMemo(() => parseCouncilTab(tabId), [tabId])

  useEffect(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNCIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNCIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNCIL_TAB

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
      contractStatuses.filter(({ admin }) => admin !== breakGlassAddress).map(({ address }) => address),
    )
  }, [userAddress, breakGlassAddress, bug, contractStatuses])

  const propagateBreakGlassContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: PROPAGATE_BREAK_GLASS_ACTION,
      actionFn: propagateBreakGlassAction,
    }),
    [propagateBreakGlassAction],
  )

  const { action: handleClickPropagateBreakGlass } = useContractAction(propagateBreakGlassContractActionProps)

  const isPropagateActionActive = Boolean(
    allPendingActions.find((actionId) => actionsMapper[actionId].actionClientId === PROPAGATE_BREAK_GLASS_ACTION_FORM),
  )

  return (
    <Page>
      <PageHeader page={'break glass council'} avatar={breakGlassAvatar} />

      {isBreakGlassCouncilLoading || isContractStatusesLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Break Glass Council Data</div>
        </DataLoaderWrapper>
      ) : (
        <>
          {!tabId && isBreakGlassCouncil && (
            <PropagateBreakGlassCouncilCard>
              <div>
                <H2Title>Propagate Break Glass</H2Title>
                <p>
                  This action can only be taken to pause all contracts in the event of a successful emergency governance
                  where a critical flaw has been detected in the Maven Finance Smart Contracts.
                </p>
              </div>

              <NewButton
                kind={BUTTON_PRIMARY}
                onClick={handleClickPropagateBreakGlass}
                disabled={!isGlassBroken || isActionActive || isPropagateActionActive}
              >
                <Icon id="plus" />
                Propagate Break Glass
              </NewButton>
            </PropagateBreakGlassCouncilCard>
          )}
          <CouncilView
            isBreakGlassCouncil
            allPendingActions={allPendingActions}
            actionsToSign={actionsToSign}
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
