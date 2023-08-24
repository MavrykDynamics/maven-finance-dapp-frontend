import { CouncilOngoingAction } from './CouncilOngoingAction.view'

// components
import { CouncilAction } from 'pages/Council/CouncilActions/CouncilAction.view'
import Pagination from 'app/App.components/Pagination/Pagination.view'
import { councilEmptyContainer } from '../Council.view'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// types
import { CouncilActionType } from 'utils/TypesAndInterfaces/Council'
import { SlidingTabButtonType } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// helpers
import { SECONDARY_SLIDING_TAB_BUTTONS } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'

type Props = {
  myPastCouncilAction: number[]
  myPastCouncilActionLength: number
  actionPendingSignature: number[]
  actionPendingSignatureLength: number
  actionsMapper: Record<number, CouncilActionType>
  numCouncilMembers: number
  activeActionTab: string
  setActiveActionTab: (arg: string) => void
  tabsList: SlidingTabButtonType[]
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
      <SlidingTabButtons kind={SECONDARY_SLIDING_TAB_BUTTONS} tabItems={tabsList} onClick={handleChangeTabs} />
      {activeActionTab === tabsList[1].text && (
        <>
          {myPastCouncilAction.length ? (
            <div>
              {myPastCouncilAction.map((item) => {
                const action = actionsMapper[item]

                return (
                  <CouncilAction
                    startDatetime={action.startDatetime}
                    key={action.id}
                    actionType={action.actionType}
                    signersCount={action.signersCount}
                    numCouncilMembers={action.councilSize}
                    councilId={action.councilId}
                  />
                )
              })}
            </div>
          ) : (
            councilEmptyContainer
          )}

          <Pagination itemsCount={myPastCouncilActionLength} listName={listNameMyPastActions} />
        </>
      )}

      {activeActionTab === tabsList[0].text && (
        <>
          {actionPendingSignature.length ? (
            <div>
              {actionPendingSignature.map((item) => {
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
              })}
            </div>
          ) : (
            councilEmptyContainer
          )}

          <Pagination itemsCount={actionPendingSignatureLength} listName={listNameMyOngoingActions} />
        </>
      )}
    </>
  )
}
