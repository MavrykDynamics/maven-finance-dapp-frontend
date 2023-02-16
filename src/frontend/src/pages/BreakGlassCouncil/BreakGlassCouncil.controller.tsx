import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from './Council.view'

// helpers
import { BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'

// styles
import { Page } from './BreakGlassCouncil.style'

// actions
import {
  getBreakGlassCouncilPendingActions,
  getBreakGlassCouncilPastActions,
  getBreakGlassCouncilMembers,
  dropBreakGlass,
  signAction,
} from './BreakGlassCouncil.actions'
import { getCouncilStorage } from 'pages/Council/Council.actions'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
  pendingReview: '/pending-review',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    councilMaxLength,
    glassBroken,
    breakGlassCouncilMembers,
    breakGlassCouncilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
    },
  } = useSelector((state: State) => state.council)

  const memberMaxLength = {
    nameMaxLength: councilMaxLength.councilMemberNameMaxLength,
    websiteMaxLength: councilMaxLength.councilMemberWebsiteMaxLength,
  }

  const handleSignAction = (id: number) => {
    dispatch(signAction(id))
  }

  const handleDropAction = (id: number) => {
    dispatch(dropBreakGlass(id))
  }

  useEffect(() => {
    dispatch(getBreakGlassCouncilPendingActions())
    dispatch(getBreakGlassCouncilPastActions())
    dispatch(getBreakGlassCouncilMembers())
    dispatch(getCouncilStorage())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) {
      dispatch(getBreakGlassCouncilPendingActions())
      dispatch(getBreakGlassCouncilPastActions())
    }
  }, [dispatch, accountPkh])

  return (
    <Page>
      <PageHeader page={'break glass council'} />

      <CouncilView
        // general info
        queryParameters={queryParameters}
        memberMaxLength={memberMaxLength}
        glassBroken={glassBroken}
        paginationListName={BREAK_GLASS_COUNCIL_ACTIONS_LIST_NAME}
        // pending actions
        allPendingActions={allPendingActions}
        notMyPendingActions={notMyPendingActions}
        myPendingActions={myPendingActions}
        // past actions
        allPastActions={allPastActions}
        myPastActions={myPastActions}
        // other lists
        members={breakGlassCouncilMembers}
        dropdowndActions={actions}
        // actions
        handleSignAction={handleSignAction}
        handleDropAction={handleDropAction}
      />
    </Page>
  )
}
