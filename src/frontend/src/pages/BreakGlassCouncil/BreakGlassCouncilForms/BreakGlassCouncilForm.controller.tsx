// components
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'
import { FormSetSingleContractAdminView } from './FormSetSingleContractAdmin.view'
import { FormSignActionView } from './FormSignAction.view'
import { FormAddCouncilMemberView } from './FormAddCouncilMember.view'
import { FormChangeCouncilMemberView } from './FormChangeCouncilMember.view'
import { FormRemoveCouncilMemberView } from './FormRemoveCouncilMember.view'

// types
import { CouncilMaxLength } from '../../../utils/TypesAndInterfaces/Council'

type Props = {
  maxLength: CouncilMaxLength
  action?: string
}

export const actions = {
  SET_ALL_CONTRACTS_ADMIN: 'SET_ALL_CONTRACTS_ADMIN',
  SET_SINGLE_CONTRACT_ADMIN: 'SET_SINGLE_CONTRACT_ADMIN',
  SIGN_ACTION: 'SIGN_ACTION',
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
}

export function BreakGlassCouncilForm({ maxLength, action }: Props) {
  return (
    <>
      {actions.SET_ALL_CONTRACTS_ADMIN === action ? <FormSetAllContractsAdminView /> : null}
      {actions.SET_SINGLE_CONTRACT_ADMIN === action ? <FormSetSingleContractAdminView /> : null}
      {actions.SIGN_ACTION === action ? <FormSignActionView /> : null}
      {actions.ADD_COUNCIL_MEMBER === action ? <FormAddCouncilMemberView {...maxLength} /> : null}
      {actions.CHANGE_COUNCIL_MEMBER === action ? (
        <FormChangeCouncilMemberView {...maxLength} />
      ) : null}
      {actions.REMOVE_COUNCIL_MEMBER === action ? <FormRemoveCouncilMemberView /> : null}
    </>
  )
}
