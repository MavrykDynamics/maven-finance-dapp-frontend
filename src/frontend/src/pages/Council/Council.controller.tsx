import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { CouncilForm, actions } from './CouncilForms/CouncilForm.controller'
import { CouncilFormUpdateCouncilMemberInfo } from './CouncilForms/CouncilFormUpdateCouncilMemberInfo.view'
import { EmptyContainer } from 'app/App.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// helpers
import { COUNCIL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// actions
import {
  getCouncilPastActions,
  getCouncilPendingActions,
  getCouncilStorage,
  getCouncilMembers,
  dropRequest,
  sign,
} from './Council.actions'

// types
import { TabItem } from 'app/App.components/TabSwitcher/TabSwitcher.controller'
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

export const councilEmptyContainer = (
  <EmptyContainer>
    <img src="/images/not-found.svg" alt=" No proposals to show" />
    <figcaption> No data to show</figcaption>
  </EmptyContainer>
)

export type QueryParameters = typeof queryParameters

const queryParameters = {
  pathname: '/mavryk-council',
  review: '/review',
  pendingReview: '/pending-review',
}

export const councilTabsList: TabItem[] = [
  {
    text: 'My Ongoing Actions',
    id: 1,
    active: true,
  },
  {
    text: 'My Past Actions',
    id: 2,
    active: false,
  },
]

const titles = {
  membersName: 'Council Members',
  cardIdName: 'Council action ID',
  allPastActions: 'Past Council Actions',
}

export const Council = () => {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    councilMaxLength,
    councilMembers,
    councilActions: { allPendingActions, notMyPendingActions, myPendingActions, allPastActions, myPastActions },
  } = useSelector((state: State) => state.council)

  const handleSignAction = (id: number) => {
    dispatch(sign(id))
  }

  const handleDropAction = (id: number) => {
    dispatch(dropRequest(id))
  }

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([
        dispatch(getCouncilStorage()),
        dispatch(getCouncilMembers()),
        dispatch(getCouncilPastActions()),
      ])
    } catch (e) {}
  }, [])

  useDataLoader(async () => {
    if (!accountPkh) return

    try {
      await Promise.all([dispatch(getCouncilPendingActions()), dispatch(getCouncilPastActions())])
    } catch (e) {}
  }, [accountPkh])

  return (
    <Page>
      <PageHeader page={'council'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading counsil</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          // general info
          queryParameters={queryParameters}
          maxLength={councilMaxLength}
          paginationListName={COUNCIL_LIST_NAME}
          titles={titles}
          // pending actions
          allPendingActions={allPendingActions}
          notMyPendingActions={notMyPendingActions}
          myPendingActions={myPendingActions}
          // past actions
          allPastActions={allPastActions}
          myPastActions={myPastActions}
          // other lists
          members={councilMembers}
          dropdowndActions={actions}
          // actions
          handleSignAction={handleSignAction}
          handleDropAction={handleDropAction}
          // components
          getFormComponent={(maxLength: CouncilMaxLength, action?: string) => (
            <CouncilForm maxLength={maxLength} action={action} />
          )}
          getFormUpdateMemberInfo={(maxLength: CouncilMaxLength) => (
            <CouncilFormUpdateCouncilMemberInfo {...maxLength} />
          )}
        />
      )}
    </Page>
  )
}
