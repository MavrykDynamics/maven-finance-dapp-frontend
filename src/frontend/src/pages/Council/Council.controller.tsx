import { useParams } from 'react-router'
import { useEffect } from 'react'

// hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// utils
import {
  ALL_PAST_COUNSIL_TAB,
  ALL_PENDING_COUNSIL_TAB,
  MY_PAST_COUNSIL_TAB,
  MY_PENDING_COUNSIL_TAB,
  parseCounsilTab,
} from './helpers/commonCouncil.utils'

// view
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// consts
import {
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from 'providers/CouncilProvider/helpers/council.consts'

export const Council = () => {
  const { tabId } = useParams<{ tabId: string }>()

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
    return () => {
      changeCouncilSubscriptionList(DEFAULT_COUNCIL_ACTIVE_SUBS)
    }
  }, [])

  useEffect(() => {
    const parsedTab = parseCounsilTab(tabId)

    const isMyPendingTab = parsedTab === MY_PENDING_COUNSIL_TAB
    const isAllPendingTab = parsedTab === ALL_PENDING_COUNSIL_TAB
    const isAllPastTab = parsedTab === ALL_PAST_COUNSIL_TAB

    changeCouncilSubscriptionList({
      [COUNCIL_MEMBERS_SUB]: true,
      // if my ongoing or all ongoing load all ongoing, if my past load my past, otherwise load all past
      [COUNCIL_ACTIONS_DATA]:
        isMyPendingTab || isAllPendingTab
          ? ALL_ONGOING_COUNCIL_ACTIONS_SUB
          : isAllPastTab
          ? ALL_PAST_COUNCIL_ACTIONS_SUB
          : MY_PAST_COUNCIL_ACTIONS_SUB,
    })
  }, [tabId])

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
          // handleDropAction={handleDropAction}
        />
      )}
    </Page>
  )
}
