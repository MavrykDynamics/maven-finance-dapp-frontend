// consts
import { MavrykCounsilDdForms, BgCounsilDdForms } from '../helpers/council.consts'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// mavryk council forms components
import { BgCouncilFormSetAllContractsAdminView } from './BreakGlassCouncilForms/BgCouncilFormSetAllContractsAdmin.view'
import { BgCouncilFormSetSelectedContractsAdminView } from './BreakGlassCouncilForms/BgCouncilFormSetSelectedContractsAdmin.view'
import { BgCouncilFormSignActionView } from './BreakGlassCouncilForms/BgCouncilFormSignAction.view'
import { BgCouncilFormAddCouncilMemberView } from './BreakGlassCouncilForms/BgCouncilFormAddCouncilMember.view'
import { BgCouncilFormChangeCouncilMemberView } from './BreakGlassCouncilForms/BgCouncilFormChangeCouncilMember.view'
import { BgCouncilFormRemoveCouncilMemberView } from './BreakGlassCouncilForms/BgCouncilFormRemoveCouncilMember.view'

// mavryk council forms components
import { MavCouncilFormAddVestee } from './MavrykCouncilForms/MavCouncilFormAddVestee.view'
import { MavCouncilFormAddCouncilMember } from './MavrykCouncilForms/MavCouncilFormAddCouncilMember.view'
import { MavCouncilFormUpdateVestee } from './MavrykCouncilForms/MavCouncilFormUpdateVestee.view'
import { MavCouncilFormRemoveVestee } from './MavrykCouncilForms/MavCouncilFormRemoveVestee.view'
import { MavCouncilFormToggleVesteeLock } from './MavrykCouncilForms/MavCouncilFormToggleVesteeLock.view'
import { MavCouncilFormChangeCouncilMember } from './MavrykCouncilForms/MavCouncilFormChangeCouncilMember.view'
import { MavCouncilFormRemoveCouncilMember } from './MavrykCouncilForms/MavCouncilFormRemoveCouncilMember.view'
import { MavCouncilFormTransferTokens } from './MavrykCouncilForms/MavCouncilFormTransferTokens.view'
import { MavCouncilFormRequestTokens } from './MavrykCouncilForms/MavCouncilFormRequestTokens.view'
import { MavCouncilFormRequestTokenMint } from './MavrykCouncilForms/MavCouncilFormRequestTokenMint.view'
import { MavCouncilFormDropFinancialRequest } from './MavrykCouncilForms/MavCouncilFormDropFinancialRequest.view'
import { MavCouncilFormSetBaker } from './MavrykCouncilForms/MavCouncilFormSetBaker.view'
import { MavCouncilFormSetContractBaker } from './MavrykCouncilForms/MavCouncilFormSetContractBaker.view'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
  members: CouncilContext['breakGlassCouncilMembers']
}

export const CouncilForms = ({ councilMaxLengths, selectedAction, members }: Props) => {
  switch (selectedAction) {
    // break glass council forms
    case BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN:
      return <BgCouncilFormSetAllContractsAdminView />
    case BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN:
      return <BgCouncilFormSetSelectedContractsAdminView />
    case BgCounsilDdForms.SIGN_ACTION:
      return <BgCouncilFormSignActionView />
    case BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER:
      return <BgCouncilFormAddCouncilMemberView councilMaxLengths={councilMaxLengths} />
    case BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER:
      return (
        <BgCouncilFormChangeCouncilMemberView
          councilMaxLengths={councilMaxLengths}
          breakGlassCouncilMembers={members}
        />
      )
    case BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER:
      return <BgCouncilFormRemoveCouncilMemberView breakGlassCouncilMembers={members} />

    // mavryk council forms
    case MavrykCounsilDdForms.ADD_VESTEE:
      return <MavCouncilFormAddVestee />
    case MavrykCounsilDdForms.ADD_COUNCIL_MEMBER:
      return <MavCouncilFormAddCouncilMember {...councilMaxLengths} />
    case MavrykCounsilDdForms.UPDATE_VESTEE:
      return <MavCouncilFormUpdateVestee />
    case MavrykCounsilDdForms.REMOVE_VESTEE:
      return <MavCouncilFormRemoveVestee />
    case MavrykCounsilDdForms.TOGGLE_VESTEE_LOCK:
      return <MavCouncilFormToggleVesteeLock />
    case MavrykCounsilDdForms.CHANGE_COUNCIL_MEMBER:
      return <MavCouncilFormChangeCouncilMember councilMaxLengths={councilMaxLengths} councilMembers={members} />
    case MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER:
      return <MavCouncilFormRemoveCouncilMember councilMembers={members} />
    case MavrykCounsilDdForms.TRANSFER_TOKENS:
      return <MavCouncilFormTransferTokens {...councilMaxLengths} />
    case MavrykCounsilDdForms.REQUEST_TOKENS:
      return <MavCouncilFormRequestTokens {...councilMaxLengths} />
    case MavrykCounsilDdForms.REQUEST_TOKEN_MINT:
      return <MavCouncilFormRequestTokenMint {...councilMaxLengths} />
    case MavrykCounsilDdForms.DROP_FINANCIAL_REQUEST:
      return <MavCouncilFormDropFinancialRequest />
    case MavrykCounsilDdForms.SET_BAKER:
      return <MavCouncilFormSetBaker />
    case MavrykCounsilDdForms.SET_CONTRACT_BAKER:
      return <MavCouncilFormSetContractBaker />
    default:
      return null
  }
}
