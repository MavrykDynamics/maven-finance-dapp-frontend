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
import { getBreakGlassStorage } from 'pages/BreakGlass/BreakGlass.actions'

// types
import { CouncilMaxLength } from 'utils/TypesAndInterfaces/Council'

const titles = {
  membersName: 'Break Glass Council',
  cardIdName: 'Break Glass Action ID',
  allPastActions: 'Past Break Glass Council Actions',
}

export function BreakGlassCouncil() {
  const dispatch = useDispatch()

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { glassBroken } = useSelector((state: State) => state.breakGlass)
  const {
    config: { councilMaxLength },
    breakGlassCouncilMembers,
    breakGlassCouncilActions: {
      allPendingActions,
      notMyPendingActions,
      myPendingActions,
      allPastActions,
      myPastActions,
      actionsMapper,
    },
    isStorageLoaded,
    isBreakGlassCouncilMembersLoaded,
    isBreakGlassCouncilPendingActionsLoaded,
    isBreakGlassCouncilPastActionsLoaded,
  } = useSelector((state: State) => state.council)

  const handleSignAction = (id: number) => {
    dispatch(signAction(id))
  }

  const handleDropAction = (id: number) => {
    dispatch(dropBreakGlass(id))
  }

  const { isLoading } = useDataLoader(async () => {
    try {
      await Promise.all(
        [
          dispatch(getBreakGlassStorage()),
          !isStorageLoaded && dispatch(getCouncilStorage()),
          !isBreakGlassCouncilMembersLoaded && dispatch(getBreakGlassCouncilMembers()),
          !isBreakGlassCouncilPastActionsLoaded && dispatch(getBreakGlassCouncilPastActions()),
        ].filter(Boolean),
      )
    } catch (e) {}
  }, [])

  // getting data after auth
  useDataLoader(async () => {
    if (!accountPkh) return

    try {
      await Promise.all(
        [
          !isBreakGlassCouncilPendingActionsLoaded && dispatch(getBreakGlassCouncilPendingActions()),
          !isBreakGlassCouncilPastActionsLoaded && dispatch(getBreakGlassCouncilPastActions()),
        ].filter(Boolean),
      )
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
          pathnameOfPage="/break-glass-council"
          maxLength={councilMaxLength}
          glassBroken={glassBroken}
          showPropagateBreakGlass
          titles={titles}
          // pending actions
          allPendingActions={allPendingActions}
          notMyPendingActions={notMyPendingActions}
          myPendingActions={myPendingActions}
          // past actions
          allPastActions={allPastActions}
          myPastActions={myPastActions}
          // mapper
          actionsMapper={actionsMapper}
          // other lists
          members={breakGlassCouncilMembers}
          dropdowndActions={actions}
          // actions
          handleSignAction={handleSignAction}
          handleDropAction={handleDropAction}
          // components
          getFormComponent={() => <BreakGlassCouncilForm />}
          getFormUpdateMemberInfo={(maxLength: CouncilMaxLength) => <FormUpdateCouncilMemberView {...maxLength} />}
        />
      )}
    </Page>
  )
}
