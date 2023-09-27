import { useParams } from 'react-router'
import { useEffect, useMemo } from 'react'

// hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// utils
import { parseCounsilTab } from './helpers/commonCouncil.utils'

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
import { ALL_PAST_COUNSIL_TAB, ALL_PENDING_COUNSIL_TAB, MY_PENDING_COUNSIL_TAB } from './helpers/council.consts'

// TODO: validate tab in url?
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

  const selectedTab = useMemo(() => parseCounsilTab(tabId), [tabId])

  useEffect(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNSIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNSIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNSIL_TAB

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
  }, [selectedTab])

  return (
    <Page>
      <PageHeader page={'council'} avatar={counsilAvatar} />

      {isCounsilLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Mavryk Council Data</div>
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
          selectedTab={selectedTab}
        />
      )}
    </Page>
  )
}
