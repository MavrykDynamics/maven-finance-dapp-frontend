import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// prviders
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from '../Council/Council.view'
import { BreakGlassCouncilForm, actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { FormUpdateCouncilMemberView } from './BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// utils
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// actions
import {
  getBreakGlassCouncilMembers,
  getBreakGlassCouncilPendingActions,
  getBreakGlassCouncilPastActions,
} from './BreakGlassCouncil.actions'
import { dropBreakGlass, signAction } from 'providers/CouncilProvider/actions/breakGlassCouncil.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import {
  DROP_BREAK_GLASS_ACTION,
  SIGN_BREAK_GLASS_ACTION,
} from 'providers/CouncilProvider/helpers/breakGlassCouncil.consts'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'

// types

const titles = {
  membersName: 'Break Glass Council',
  cardIdName: 'Break Glass Action ID',
  allPastActions: 'Past Break Glass Council Actions',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()

  const {
    maxLengths: { council: councilMaxLengths },
    contractAddresses: { breakGlassAddress },
  } = useDappConfigContext()

  const {
    userAddress,
    userAvatars: { breakGlassAvatar },
  } = useUserContext()

  const { bug } = useToasterContext()

  const {
    breakGlassCouncilMembers,
    breakGlassCouncilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
    isBreakGlassCouncilMembersLoaded,
    isBreakGlassCouncilPendingActionsLoaded,
    isBreakGlassCouncilPastActionsLoaded,
  } = useSelector((state: State) => state.council)
  const {
    config: { emergencyGovActive },
  } = useSelector((state: State) => state.emergencyGovernance)

  // two actions have same parameters, so to avoid code duplication we use this helper
  const actionWithIdCaller = useCallback(
    (
      action: (
        breakGlassAddress: string,
        breakGlassActionID: number,
      ) => Promise<ActionErrorReturnType | ActionSuccessReturnType>,
    ) => {
      return async (id: number) => {
        if (!userAddress) {
          bug('Click Connect in the left menu', 'Please connect your wallet')
          return null
        }

        if (!breakGlassAddress) {
          bug('Wrong breakGlass address')
          return null
        }

        return await action(breakGlassAddress, id)
      }
    },
    [breakGlassAddress, bug, userAddress],
  )

  // Sign action
  const signActionContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: SIGN_BREAK_GLASS_ACTION,
      actionFn: actionWithIdCaller(signAction),
    }),
    [actionWithIdCaller],
  )

  const { actionWithArgs: handleSignAction } = useContractAction(signActionContractActionProps)

  // Drop action
  const dropBreakGlassContractActionProps: HookContractActionArgs<number> = useMemo(
    () => ({
      actionType: DROP_BREAK_GLASS_ACTION,
      actionFn: actionWithIdCaller(dropBreakGlass),
    }),
    [actionWithIdCaller],
  )

  const { actionWithArgs: handleDropAction } = useContractAction(dropBreakGlassContractActionProps)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isBreakGlassCouncilMembersLoaded || isDepsChanged) && dispatch(getBreakGlassCouncilMembers()),
          (!isBreakGlassCouncilPastActionsLoaded || isDepsChanged) && dispatch(getBreakGlassCouncilPastActions()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  // getting data after auth
  useDataLoader(
    async (isDepsChanged) => {
      if (!userAddress) return

      try {
        await Promise.all(
          [
            (!isBreakGlassCouncilPendingActionsLoaded || isDepsChanged) &&
              dispatch(getBreakGlassCouncilPendingActions()),
            (!isBreakGlassCouncilPastActionsLoaded || isDepsChanged) && dispatch(getBreakGlassCouncilPastActions()),
          ].filter(Boolean),
        )
      } catch (e) {}
    },
    [userAddress],
  )

  return (
    <Page>
      <PageHeader page={'break glass council'} avatar={breakGlassAvatar} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading break glass counsil</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          // general info
          pathnameOfPage="/break-glass-council"
          maxLength={councilMaxLengths}
          // TODO: clarify this field with @CasualJackie & @Sam-M-Israel
          glassBroken={!emergencyGovActive}
          showPropagateBreakGlass
          titles={titles}
          // pending actions
          allPendingActions={allPendingActions}
          notMyPendingActions={notMyPendingActions}
          myPendingActions={myPendingActions}
          // past actions
          allPastActions={allPastActions}
          myPastActions={myPastActions}
          // mapper
          actionsMapper={actionsMapper}
          // other lists
          members={breakGlassCouncilMembers}
          dropdowndActions={actions}
          // actions
          handleSignAction={handleSignAction}
          handleDropAction={handleDropAction}
          // components
          getFormComponent={() => <BreakGlassCouncilForm />}
          getFormUpdateMemberInfo={(maxLength, callback: () => void) => (
            <FormUpdateCouncilMemberView maxLength={maxLength} callback={callback} />
          )}
        />
      )}
    </Page>
  )
}
