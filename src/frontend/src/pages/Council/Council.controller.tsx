import { useParams } from 'react-router'
import { useEffect, useMemo } from 'react' // hooks
import { useCouncilContext } from 'providers/CouncilProvider/council.provider'
import { useUserContext } from 'providers/UserProvider/user.provider' // utils
import { parseCouncilTab } from './helpers/commonCouncil.utils' // view
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view' // consts
import {
  ALL_ONGOING_COUNCIL_ACTIONS_SUB,
  ALL_PAST_COUNCIL_ACTIONS_SUB,
  COUNCIL_ACTIONS_DATA,
  COUNCIL_MEMBERS_SUB,
  DEFAULT_COUNCIL_ACTIVE_SUBS,
  MY_PAST_COUNCIL_ACTIONS_SUB,
} from 'providers/CouncilProvider/helpers/council.consts'
import { ALL_PAST_COUNCIL_TAB, ALL_PENDING_COUNCIL_TAB, MY_PENDING_COUNCIL_TAB } from './helpers/council.consts' // TODO: validate tab in url?

// TODO: validate tab in url?
export const Council = () => {
  const { tabId } = useParams<{ tabId: string }>()

  const {
    userAvatars: { councilAvatar },
  } = useUserContext()
  const {
    changeCouncilSubscriptionList,
    councilMembers,
    isLoading: isCouncilLoading,
    councilActions: {
      allPendingActions,
      actionsToSign,
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

  const selectedTab = useMemo(() => parseCouncilTab(tabId), [tabId])

  useEffect(() => {
    const isMyPendingTab = selectedTab === MY_PENDING_COUNCIL_TAB
    const isAllPendingTab = selectedTab === ALL_PENDING_COUNCIL_TAB
    const isAllPastTab = selectedTab === ALL_PAST_COUNCIL_TAB

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
      <PageHeader page={'council'} avatar={councilAvatar} />

      {isCouncilLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Maven Finance Council Data</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          allPendingActions={allPendingActions}
          actionsToSign={actionsToSign}
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
