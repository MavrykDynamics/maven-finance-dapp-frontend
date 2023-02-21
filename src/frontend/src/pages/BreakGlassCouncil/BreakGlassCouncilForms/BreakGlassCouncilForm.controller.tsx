import { useLocation } from 'react-router-dom'
import qs from 'qs'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'
import { FormSetSingleContractAdminView } from './FormSetSingleContractAdmin.view'
import { FormSignActionView } from './FormSignAction.view'
import { FormAddCouncilMemberView } from './FormAddCouncilMember.view'
import { FormChangeCouncilMemberView } from './FormChangeCouncilMember.view'
import { FormRemoveCouncilMemberView } from './FormRemoveCouncilMember.view'

export const actions = {
  SET_ALL_CONTRACTS_ADMIN: 'SET_ALL_CONTRACTS_ADMIN',
  SET_SINGLE_CONTRACT_ADMIN: 'SET_SINGLE_CONTRACT_ADMIN',
  SIGN_ACTION: 'SIGN_ACTION',
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
}

export function BreakGlassCouncilForm() {
  const { search } = useLocation()
  const { action } = qs.parse(search, { ignoreQueryPrefix: true })

  const {
    config: { councilMaxLength },
  } = useSelector((state: State) => state.council)

  switch (action) {
    case actions.SET_ALL_CONTRACTS_ADMIN:
      return <FormSetAllContractsAdminView />
    case actions.SET_SINGLE_CONTRACT_ADMIN:
      return <FormSetSingleContractAdminView />
    case actions.SIGN_ACTION:
      return <FormSignActionView />
    case actions.ADD_COUNCIL_MEMBER:
      return <FormAddCouncilMemberView {...councilMaxLength} />
    case actions.CHANGE_COUNCIL_MEMBER:
      return <FormChangeCouncilMemberView {...councilMaxLength} />
    case actions.REMOVE_COUNCIL_MEMBER:
      return <FormRemoveCouncilMemberView />

    default:
      return <></>
  }
}
