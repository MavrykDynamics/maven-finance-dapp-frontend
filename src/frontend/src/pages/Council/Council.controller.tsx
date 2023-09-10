import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { CouncilForm, actions } from './CouncilForms/CouncilForm.controller'
import { CouncilFormUpdateCouncilMemberInfo } from './CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// helpers
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// actions
import {
  getCouncilPastActions,
  getCouncilPendingActions,
  getCouncilMembers,
  // dropRequest,
  // sign,
} from './Council.actions'
import { useUserContext } from 'providers/UserProvider/user.provider'

// types

const titles = {
  membersName: 'Council Members',
  cardIdName: 'Council action ID',
  allPastActions: 'Past Council Actions',
}

export const Council = () => {
  const dispatch = useDispatch()

  const {
    maxLengths: { council: councilMaxLengths },
  } = useDappConfigContext()

  const {
    userAddress,
    userAvatars: { counsilAvatar },
  } = useUserContext()

  const {
    councilMembers,
    councilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
    isStorageLoaded,
    isCouncilMembersLoaded,
    isCouncilPendingActionsLoaded,
    isCouncilPastActionsLoaded,
  } = useSelector((state: State) => state.council)

  const handleSignAction = (id: number) => {
    // dispatch(sign(id))
  }

  const handleDropAction = (id: number) => {
    // dispatch(dropRequest(id))
  }

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      await Promise.all(
        [
          (!isCouncilMembersLoaded || isDepsChanged) && dispatch(getCouncilMembers()),
          (!isCouncilPastActionsLoaded || isDepsChanged) && dispatch(getCouncilPastActions()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  useDataLoader(
    async (isDepsChanged) => {
      if (!userAddress) return

      try {
        await Promise.all(
          [
            (!isCouncilPendingActionsLoaded || isDepsChanged) && dispatch(getCouncilPendingActions()),
            (!isCouncilPastActionsLoaded || isDepsChanged) && dispatch(getCouncilPastActions()),
          ].filter(Boolean),
        )
      } catch (e) {}
    },
    [userAddress],
  )

  return (
    <Page>
      <PageHeader page={'council'} avatar={counsilAvatar} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading counsil</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          // general info
          pathnameOfPage="/mavryk-council"
          maxLength={councilMaxLengths}
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
          members={councilMembers}
          dropdowndActions={actions}
          // actions
          handleSignAction={handleSignAction}
          handleDropAction={handleDropAction}
          // components
          getFormComponent={() => <CouncilForm />}
          getFormUpdateMemberInfo={(maxLength, callback: () => void) => (
            <CouncilFormUpdateCouncilMemberInfo maxLength={maxLength} callback={callback} />
          )}
        />
      )}
    </Page>
  )
}
