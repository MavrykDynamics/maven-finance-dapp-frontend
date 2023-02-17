import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { CouncilView } from '../Council/Council.view'
import { BreakGlassCouncilForm, actions } from './BreakGlassCouncilForms/BreakGlassCouncilForm.controller'
import { FormUpdateCouncilMemberView } from './BreakGlassCouncilForms/FormUpdateCouncilMember.view'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// helpers
import { COUNCIL_LIST_NAME } from 'pages/FinacialRequests/Pagination/pagination.consts'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// actions
import {
  getBreakGlassCouncilMembers,
  getBreakGlassCouncilPendingActions,
  getBreakGlassCouncilPastActions,
  dropBreakGlass,
  signAction,
} from './BreakGlassCouncil.actions'
import { getCouncilStorage } from 'pages/Council/Council.actions'

// types
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

const queryParameters = {
  pathname: '/break-glass-council',
  review: '/review',
  pendingReview: '/pending-review',
}

const titles = {
  membersName: 'Break Glass Council',
  cardIdName: 'Break Glass Action ID',
  allPastActions: 'Past Break Glass Council Actions',
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

  const handleSignAction = (id: number) => {
    dispatch(signAction(id))
  }

  const handleDropAction = (id: number) => {
    dispatch(dropBreakGlass(id))
  }

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all([
        dispatch(getCouncilStorage()),
        dispatch(getBreakGlassCouncilMembers()),
        dispatch(getBreakGlassCouncilPastActions()),
      ])
    } catch (e) {}
  }, [])

  useDataLoader(async () => {
    if (!accountPkh) return

    try {
      await Promise.all([dispatch(getBreakGlassCouncilPendingActions()), dispatch(getBreakGlassCouncilPastActions())])
    } catch (e) {}
  }, [accountPkh])

  return (
    <Page>
      <PageHeader page={'break glass council'} />

      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading break glass counsil</div>
        </DataLoaderWrapper>
      ) : (
        <CouncilView
          // general info
          queryParameters={queryParameters}
          maxLength={councilMaxLength}
          glassBroken={glassBroken}
          showPropagateBreakGlass
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
          members={breakGlassCouncilMembers}
          dropdowndActions={actions}
          // actions
          handleSignAction={handleSignAction}
          handleDropAction={handleDropAction}
          // components
          getFormComponent={(maxLength: CouncilMaxLength, action?: string) => (
            <BreakGlassCouncilForm maxLength={maxLength} action={action} />
          )}
          getFormUpdateMemberInfo={(maxLength: CouncilMaxLength) => <FormUpdateCouncilMemberView {...maxLength} />}
        />
      )}
    </Page>
  )
}
