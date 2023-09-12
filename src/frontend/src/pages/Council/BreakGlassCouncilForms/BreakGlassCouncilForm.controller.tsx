// consts
import { BgCounsilDdForms } from '../helpers/breakGlassCouncil.consts'

// types
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// view
import { FormSetAllContractsAdminView } from './FormSetAllContractsAdmin.view'
import { FormSetSingleContractAdminView } from './FormSetSingleContractAdmin.view'
import { FormSignActionView } from './FormSignAction.view'
import { FormAddCouncilMemberView } from './FormAddCouncilMember.view'
import { FormChangeCouncilMemberView } from './FormChangeCouncilMember.view'
import { FormRemoveCouncilMemberView } from './FormRemoveCouncilMember.view'
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
  members: CouncilContext['breakGlassCouncilMembers']
}

export function BreakGlassCouncilForm({ councilMaxLengths, selectedAction, members }: Props) {
  switch (selectedAction) {
    case BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN:
      return <FormSetAllContractsAdminView />
    case BgCounsilDdForms.SET_SINGLE_CONTRACT_ADMIN:
      return <FormSetSingleContractAdminView />
    case BgCounsilDdForms.SIGN_ACTION:
      return <FormSignActionView />
    case BgCounsilDdForms.ADD_COUNCIL_MEMBER:
      return <FormAddCouncilMemberView councilMaxLengths={councilMaxLengths} />
    case BgCounsilDdForms.CHANGE_COUNCIL_MEMBER:
      return <FormChangeCouncilMemberView councilMaxLengths={councilMaxLengths} breakGlassCouncilMembers={members} />
    case BgCounsilDdForms.REMOVE_COUNCIL_MEMBER:
      return <FormRemoveCouncilMemberView breakGlassCouncilMembers={members} />

    default:
      return null
  }
}
