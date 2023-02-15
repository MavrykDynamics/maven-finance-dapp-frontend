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
  getBreakGlassActionPendingSignature,
  getMyPastBreakGlassCouncilAction,
  getPastBreakGlassCouncilAction,
  getBreakGlassCouncilMember,
  dropBreakGlass,
  signAction,
} from './BreakGlassCouncil.actions'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
  pendingReview: '/pending-review',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)

  const {
    breakGlassStorage,
    breakGlassCouncilMember,
    breakGlassActionPendingAllSignature,
    breakGlassActionPendingSignature,
    breakGlassActionPendingMySignature,
    pastBreakGlassCouncilAction,
    myPastBreakGlassCouncilAction,
    glassBroken,
  } = useSelector((state: State) => state.breakGlass)

  const memberMaxLength = {
    nameMaxLength: breakGlassStorage?.config?.councilMemberNameMaxLength,
    websiteMaxLength: breakGlassStorage?.config?.councilMemberWebsiteMaxLength,
  }

  const handleSignAction = (id: number) => {
    dispatch(signAction(id))
  }

  const handleDropAction = (id: number) => {
    dispatch(dropBreakGlass(id))
  }

  useEffect(() => {
    dispatch(getPastBreakGlassCouncilAction())
    dispatch(getBreakGlassCouncilMember())
  }, [dispatch])

  useEffect(() => {
    if (accountPkh) {
      dispatch(getMyPastBreakGlassCouncilAction())
      dispatch(getBreakGlassActionPendingSignature())
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
        allPendingActions={breakGlassActionPendingAllSignature}
        notMyPendingActions={breakGlassActionPendingSignature}
        myPendingActions={breakGlassActionPendingMySignature}
        // past actions
        allPastActions={pastBreakGlassCouncilAction}
        myPastActions={myPastBreakGlassCouncilAction}
        // other lists
        members={breakGlassCouncilMember}
        dropdowndActions={actions}
        // actions
        handleSignAction={handleSignAction}
        handleDropAction={handleDropAction}
      />
    </Page>
  )
}
