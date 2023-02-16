import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from 'pages/Council/Council.view'
import { CouncilForm, actions } from './CouncilForms/CouncilForm.controller'
import { EmptyContainer } from 'app/App.style'

// helpers
import { COUNCIL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'

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

  useEffect(() => {
    dispatch(getCouncilStorage())
    dispatch(getCouncilMembers())
    dispatch(getCouncilPastActions())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) {
      dispatch(getCouncilPendingActions())
      dispatch(getCouncilPastActions())
    }
  }, [accountPkh, dispatch])

  return (
    <Page>
      <PageHeader page={'council'} />

      <CouncilView
        // general info
        queryParameters={queryParameters}
        maxLength={councilMaxLength}
        paginationListName={COUNCIL_LIST_NAME}
        getFormComponent={(maxLength: CouncilMaxLength, action?: string) => (
          <CouncilForm maxLength={maxLength} action={action} />
        )}
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
      />
    </Page>
  )
}
