import { useEffect } from 'react'
import { useLocation } from 'react-router'

// hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// view
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// consts
import {
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from 'providers/CouncilProvider/helpers/council.consts'

// types

export const Council = () => {
  const { search } = useLocation()

  const {
    maxLengths: { council: councilMaxLengths },
  } = useDappConfigContext()
  const {
    userAvatars: { counsilAvatar },
  } = useUserContext()
  const {
    changeCouncilSubscriptionList,
    councilMembers,
    isLoading: isCounsilLoading,
    councilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
  } = useCouncilContext()

  useEffect(() => {
    changeCouncilSubscriptionList({
      [COUNCIL_MEMBERS_SUB]: true,
      [COUNCIL_ACTIONS_DATA]: MY_PAST_COUNCIL_ACTIONS_SUB, // filter based on search
    })

    return () => {
      changeCouncilSubscriptionList(DEFAULT_COUNCIL_ACTIVE_SUBS)
    }
  }, [])

  const handleSignAction = (id: number) => {
    // dispatch(sign(id))
  }

  const handleDropAction = (id: number) => {
    // dispatch(dropRequest(id))
  }

  return (
    <Page>
      <PageHeader page={'council'} avatar={counsilAvatar} />

      {isCounsilLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading counsil</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          allPendingActions={allPendingActions}
          notMyPendingActions={notMyPendingActions}
          myPendingActions={myPendingActions}
          allPastActions={allPastActions}
          myPastActions={myPastActions}
          actionsMapper={actionsMapper}
          members={councilMembers}
          // actions
          // handleSignAction={handleSignAction}
          // handleDropAction={handleDropAction}
          // components
          // getFormComponent={() => <CouncilForm />}
          // getFormUpdateMemberInfo={(maxLength, callback: () => void) => (
          //   <CouncilFormUpdateCouncilMemberInfo maxLength={maxLength} callback={callback} />
          // )}
        />
      )}
    </Page>
  )
}
