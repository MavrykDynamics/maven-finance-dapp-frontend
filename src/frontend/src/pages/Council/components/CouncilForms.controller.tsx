// consts
import { MavrykCounsilDdForms } from '../helpers/mavrykCouncil.consts'
import { BgCounsilDdForms } from '../helpers/breakGlassCouncil.consts'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// mavryk council forms components
import { FormSetAllContractsAdminView } from '../BreakGlassCouncilForms/FormSetAllContractsAdmin.view'
import { FormSetSingleContractAdminView } from '../BreakGlassCouncilForms/FormSetSingleContractAdmin.view'
import { FormSignActionView } from '../BreakGlassCouncilForms/FormSignAction.view'
import { FormAddCouncilMemberView } from '../BreakGlassCouncilForms/FormAddCouncilMember.view'
import { FormChangeCouncilMemberView } from '../BreakGlassCouncilForms/FormChangeCouncilMember.view'
import { FormRemoveCouncilMemberView } from '../BreakGlassCouncilForms/FormRemoveCouncilMember.view'

// mavryk council forms components
import { CouncilFormAddVestee } from '../CouncilForms/CouncilFormAddVestee.view'
import { CouncilFormAddCouncilMember } from '../CouncilForms/CouncilFormAddCouncilMember.view'
import { CouncilFormUpdateVestee } from '../CouncilForms/CouncilFormUpdateVestee.view'
import { CouncilFormRemoveVestee } from '../CouncilForms/CouncilFormRemoveVestee.view'
import { CouncilFormToggleVesteeLock } from '../CouncilForms/CouncilFormToggleVesteeLock.view'
import { CouncilFormChangeCouncilMember } from '../CouncilForms/CouncilFormChangeCouncilMember.view'
import { CouncilFormRemoveCouncilMember } from '../CouncilForms/CouncilFormRemoveCouncilMember.view'
import { CouncilFormTransferTokens } from '../CouncilForms/CouncilFormTransferTokens.view'
import { CouncilFormRequestTokens } from '../CouncilForms/CouncilFormRequestTokens.view'
import { CouncilFormRequestTokenMint } from '../CouncilForms/CouncilFormRequestTokenMint.view'
import { CouncilFormDropFinancialRequest } from '../CouncilForms/CouncilFormDropFinancialRequest.view'
import { CouncilFormSetBaker } from '../CouncilForms/CouncilFormSetBaker.view'
import { CouncilFormSetContractBaker } from '../CouncilForms/CouncilFormSetContractBaker.view'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
  members: CouncilContext['breakGlassCouncilMembers']
}

export const CouncilForms = ({ councilMaxLengths, selectedAction, members }: Props) => {
  switch (selectedAction) {
    // break glass council forms
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

    // mavryk council forms
    case MavrykCounsilDdForms.ADD_VESTEE:
      return <CouncilFormAddVestee />
    case MavrykCounsilDdForms.ADD_COUNCIL_MEMBER:
      return <CouncilFormAddCouncilMember {...councilMaxLengths} />
    case MavrykCounsilDdForms.UPDATE_VESTEE:
      return <CouncilFormUpdateVestee />
    case MavrykCounsilDdForms.REMOVE_VESTEE:
      return <CouncilFormRemoveVestee />
    case MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK:
      return <CouncilFormToggleVesteeLock />
    case MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER:
      return <CouncilFormChangeCouncilMember councilMaxLengths={councilMaxLengths} councilMembers={members} />
    case MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER:
      return <CouncilFormRemoveCouncilMember councilMembers={members} />
    case MavrykCounsilDdForms.TRANSFER_TOKENS:
      return <CouncilFormTransferTokens {...councilMaxLengths} />
    case MavrykCounsilDdForms.REQUEST_TOKENS:
      return <CouncilFormRequestTokens {...councilMaxLengths} />
    case MavrykCounsilDdForms.REQUEST_TOKEN_MINT:
      return <CouncilFormRequestTokenMint {...councilMaxLengths} />
    case MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST:
      return <CouncilFormDropFinancialRequest />
    case MavrykCounsilDdForms.SET_BAKER:
      return <CouncilFormSetBaker />
    case MavrykCounsilDdForms.SET_CONTRACT_BAKER:
      return <CouncilFormSetContractBaker />
    default:
      return null
  }
}
