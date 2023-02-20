import React from 'react'
import { CouncilOngoingAction } from './CouncilActions/CouncilOngoingAction.view'

// components
import { CouncilPastActionView } from 'pages/Council/CouncilActions/CouncilPastAction.view'
import Pagination from 'app/Pagination/Pagination.view'
import { councilEmptyContainer } from './Council.controller'

// styles
import { TabSwitcher } from './Council.style'

// types
import { BreakGlassActions } from 'utils/TypesAndInterfaces/BreakGlass'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { CouncilActions } from 'utils/TypesAndInterfaces/Council'
import { CouncilPageType } from './CouncilActions/CouncilOngoingAction.view'

type MyPastCouncilActionType = (BreakGlassActions[0] | CouncilActions[0]) & {
  councilId?: string
  breakGlassId?: string
}

type Props = {
  myPastCouncilAction: MyPastCouncilActionType[]
  myPastCouncilActionLength: number
  actionPendingSignature: BreakGlassActions | CouncilActions
  actionPendingSignatureLength: number
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: TabItem[]
  handleDropAction: (arg: number) => void
  listNameMyPastActions: string
  listNameMyOngoingActions: string
  pageType: CouncilPageType
}

export function MyCouncilActions({
  myPastCouncilAction,
  myPastCouncilActionLength,
  actionPendingSignature,
  actionPendingSignatureLength,
  numCouncilMembers,
  activeActionTab,
  setActiveActionTab,
  tabsList,
  handleDropAction,
  listNameMyPastActions,
  listNameMyOngoingActions,
  pageType,
}: Props) {
  const handleChangeTabs = (tabId?: number) => {
    setActiveActionTab(tabId === 1 ? tabsList[0].text : tabsList[1].text)
  }
  return (
    <>
      <TabSwitcher tabItems={tabsList} onClick={handleChangeTabs} />
      {activeActionTab === tabsList[1].text && (
        <>
          {myPastCouncilAction.length
            ? myPastCouncilAction.map((item) => (
                <CouncilPastActionView
                  startDatetime={String(item.startDatetime)}
                  key={item.id}
                  actionType={item.actionType}
                  signersCount={item.signersCount}
                  numCouncilMembers={numCouncilMembers}
                  councilId={item?.breakGlassId || item?.councilId || ''}
                />
              ))
            : councilEmptyContainer}

          <Pagination itemsCount={myPastCouncilActionLength} listName={listNameMyPastActions} />
        </>
      )}

      {activeActionTab === tabsList[0].text && (
        <>
          {actionPendingSignature.length
            ? actionPendingSignature.map((item) => (
                <CouncilOngoingAction
                  {...item}
                  key={String(item.id)}
                  numCouncilMembers={numCouncilMembers}
                  handleDropAction={handleDropAction}
                  pageType={pageType}
                />
              ))
            : councilEmptyContainer}

          <Pagination itemsCount={actionPendingSignatureLength} listName={listNameMyOngoingActions} />
        </>
      )}
    </>
  )
}
