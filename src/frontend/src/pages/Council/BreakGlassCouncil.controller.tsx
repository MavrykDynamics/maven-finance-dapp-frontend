import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// prviders
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from './Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// utils

// actions
import {
  dropBreakGlass,
  propagateBreakGlass,
  signAction,
} from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import {
  BREAK_GLASS_COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  DROP_BREAK_GLASS_ACTION,
  PROPAGATE_BREAK_GLASS_ACTION,
  SIGN_BREAK_GLASS_ACTION,
} from 'providers/CouncilProvider/helpers/council.consts'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import qs from 'qs'
import { useLocation, useParams } from 'react-router'
import { PropagateBreakGlassCouncilCard } from 'pages/Council/Council.style'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { BUTTON_PRIMARY } from 'app/App.components/Button/Button.constants'

export function BreakGlassCouncil() {
  const { tabId } = useParams<{ tabId: string }>()

  const { bug } = useToasterContext()

  const {
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()
  const {
    userAddress,
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

  useEffect(() => {
    changeCouncilSubscriptionList({ [BREAK_GLASS_COUNCIL_MEMBERS_SUB]: true })

    return () => {
      changeCouncilSubscriptionList(DEFAULT_COUNCIL_ACTIVE_SUBS)
    }
  }, [])

  const {
    config: { emergencyGovActive },
  } = useSelector((state: State) => state.emergencyGovernance)

  const isCouncilMember = Boolean(breakGlassCouncilMembers.find((item) => item.userId === userAddress)?.id)

  // two actions have same parameters, so to avoid code duplication we use this helper
  // const actionWithIdCaller = useCallback(
  //   (
  //     action: (
  //       breakGlassAddress: string,
  //       breakGlassActionID: number,
  //     ) => Promise<ActionErrorReturnType | ActionSuccessReturnType>,
  //   ) => {
  //     return async (id: number) => {
  //       if (!userAddress) {
  //         bug('Click Connect in the left menu', 'Please connect your wallet')
  //         return null
  //       }

  //       if (!breakGlassAddress) {
  //         bug('Wrong breakGlass address')
  //         return null
  //       }

  //       return await action(breakGlassAddress, id)
  //     }
  //   },
  //   [breakGlassAddress, bug, userAddress],
  // )

  // Sign action
  // const signActionContractActionProps: HookContractActionArgs<number> = useMemo(
  //   () => ({
  //     actionType: SIGN_BREAK_GLASS_ACTION,
  //     actionFn: actionWithIdCaller(signAction),
  //   }),
  //   [actionWithIdCaller],
  // )

  // const { actionWithArgs: handleSignAction } = useContractAction(signActionContractActionProps)

  // // Drop action
  // const dropBreakGlassContractActionProps: HookContractActionArgs<number> = useMemo(
  //   () => ({
  //     actionType: DROP_BREAK_GLASS_ACTION,
  //     actionFn: actionWithIdCaller(dropBreakGlass),
  //   }),
  //   [actionWithIdCaller],
  // )

  // const { actionWithArgs: handleDropAction } = useContractAction(dropBreakGlassContractActionProps)

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

    return await propagateBreakGlass(breakGlassAddress)
  }, [userAddress, breakGlassAddress, bug])

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

      {isBreakGlassCounsilLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Break Glass Counsil</div>
        </DataLoaderWrapper>
      ) : (
        <>
          {!tabId && isCouncilMember && (
            <PropagateBreakGlassCouncilCard>
              <div>
                <h1>Propagate Break Glass</h1>
                <p>
                  This action can only be taken to pause all contracts in the event of a successful emergency governance
                  where a critical flaw has been detected in the Mavryk Smart Contracts.
                </p>
              </div>

              {/*  TODO: clarify disabled this field with @CasualJackie & @Sam-M-Israel */}
              <NewButton kind={BUTTON_PRIMARY} onClick={handleClickPropagateBreakGlass} disabled={!emergencyGovActive}>
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
            // actions
            // handleSignAction={handleSignAction}
            // handleDropAction={handleDropAction}
            // components
            // getFormComponent={() => <BreakGlassCouncilForm />}
            // getFormUpdateMemberInfo={(maxLength, callback: () => void) => (
            //   <FormUpdateCouncilMemberView maxLength={maxLength} callback={callback} />
            // )}
          />
        </>
      )}
    </Page>
  )
}
