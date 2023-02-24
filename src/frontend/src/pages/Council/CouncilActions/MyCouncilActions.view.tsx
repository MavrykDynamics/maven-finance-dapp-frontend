import { CouncilOngoingAction } from './CouncilOngoingAction.view'

// components
import { CouncilPastActionView } from 'pages/Council/CouncilActions/CouncilPastAction.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { councilEmptyContainer } from '../Council.view'

// styles
import { TabSwitcher } from '../Council.style'

// types
import { CouncilAction } from 'utils/TypesAndInterfaces/Council'
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'

type Props = {
  myPastCouncilAction: number[]
  myPastCouncilActionLength: number
  actionPendingSignature: number[]
  actionPendingSignatureLength: number
  actionsMapper: Record<number, CouncilAction>
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: TabItem[]
  handleDropAction: (arg: number) => void
  listNameMyPastActions: string
  listNameMyOngoingActions: string
  cardIdName: string
}

export function MyCouncilActions({
  myPastCouncilAction,
  myPastCouncilActionLength,
  actionPendingSignature,
  actionPendingSignatureLength,
  actionsMapper,
  numCouncilMembers,
  activeActionTab,
  setActiveActionTab,
  tabsList,
  handleDropAction,
  listNameMyPastActions,
  listNameMyOngoingActions,
  cardIdName,
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
            ? myPastCouncilAction.map((item) => {
                const action = actionsMapper[item]

                return (
                  <CouncilPastActionView
                    startDatetime={action.startDatetime}
                    key={action.id}
                    actionType={action.actionType}
                    signersCount={action.signersCount}
                    numCouncilMembers={numCouncilMembers}
                    councilId={action.councilId}
                  />
                )
              })
            : councilEmptyContainer}

          <Pagination itemsCount={myPastCouncilActionLength} listName={listNameMyPastActions} />
        </>
      )}

      {activeActionTab === tabsList[0].text && (
        <>
          {actionPendingSignature.length
            ? actionPendingSignature.map((item) => {
                const action = actionsMapper[item]

                return (
                  <CouncilOngoingAction
                    {...action}
                    key={action.id}
                    numCouncilMembers={numCouncilMembers}
                    handleDropAction={handleDropAction}
                    cardIdName={cardIdName}
                  />
                )
              })
            : councilEmptyContainer}

          <Pagination itemsCount={actionPendingSignatureLength} listName={listNameMyOngoingActions} />
        </>
      )}
    </>
  )
}
