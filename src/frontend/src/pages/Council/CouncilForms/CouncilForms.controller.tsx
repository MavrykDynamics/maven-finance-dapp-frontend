// consts
import { MavrykCounsilDdForms, BgCounsilDdForms } from '../helpers/council.consts'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// mavryk council forms components
import { BgCouncilFormSetAllContractsAdmin } from './BreakGlassCouncilForms/BgCouncilFormSetAllContractsAdmin'
import { BgCouncilFormSetSelectedContractsAdmin } from './BreakGlassCouncilForms/BgCouncilFormSetSelectedContractsAdmin'
import { BgCouncilFormSignAction } from './BreakGlassCouncilForms/BgCouncilFormSignAction'
import { BgCouncilFormAddCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormAddCouncilMember'
import { BgCouncilFormChangeCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormChangeCouncilMember'
import { BgCouncilFormRemoveCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormRemoveCouncilMember'

// mavryk council forms components
import { MavCouncilFormAddVestee } from './MavrykCouncilForms/MavCouncilFormAddVestee'
import { MavCouncilFormAddCouncilMember } from './MavrykCouncilForms/MavCouncilFormAddCouncilMember'
import { MavCouncilFormUpdateVestee } from './MavrykCouncilForms/MavCouncilFormUpdateVestee'
import { MavCouncilFormRemoveVestee } from './MavrykCouncilForms/MavCouncilFormRemoveVestee'
import { MavCouncilFormToggleVesteeLock } from './MavrykCouncilForms/MavCouncilFormToggleVesteeLock'
import { MavCouncilFormChangeCouncilMember } from './MavrykCouncilForms/MavCouncilFormChangeCouncilMember'
import { MavCouncilFormRemoveCouncilMember } from './MavrykCouncilForms/MavCouncilFormRemoveCouncilMember'
import { MavCouncilFormTransferTokens } from './MavrykCouncilForms/MavCouncilFormTransferTokens'
import { MavCouncilFormRequestTokens } from './MavrykCouncilForms/MavCouncilFormRequestTokens'
import { MavCouncilFormRequestTokenMint } from './MavrykCouncilForms/MavCouncilFormRequestTokenMint'
import { MavCouncilFormDropFinancialRequest } from './MavrykCouncilForms/MavCouncilFormDropFinancialRequest'
import { MavCouncilFormSetBaker } from './MavrykCouncilForms/MavCouncilFormSetBaker'
import { MavCouncilFormSetContractBaker } from './MavrykCouncilForms/MavCouncilFormSetContractBaker'
import { BgCouncilFormUnpauseAllEntrypoints } from './BreakGlassCouncilForms/BgCouncilFormUnpauseAllEntrypoints'
import { BgCouncilFormRemoveBreakGlassControl } from './BreakGlassCouncilForms/BgCouncilFormRemoveBreakGlassControl'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
  members: CouncilContext['breakGlassCouncilMembers']
}

export const CouncilForms = ({ councilMaxLengths, selectedAction, members }: Props) => {
  switch (selectedAction) {
    // break glass council forms
    case BgCounsilDdForms.SET_ALL_CONTRACTS_ADMIN:
      return <BgCouncilFormSetAllContractsAdmin />
    case BgCounsilDdForms.SET_SELECTED_CONTRACTS_ADMIN:
      return <BgCouncilFormSetSelectedContractsAdmin />
    case BgCounsilDdForms.SIGN_ACTION:
      return <BgCouncilFormSignAction />
    case BgCounsilDdForms.BG_ADD_COUNCIL_MEMBER:
      return <BgCouncilFormAddCouncilMember maxLength={councilMaxLengths} breakGlassCouncilMembers={members} />
    case BgCounsilDdForms.BG_REMOVE_COUNCIL_MEMBER:
      return <BgCouncilFormRemoveCouncilMember breakGlassCouncilMembers={members} />
    case BgCounsilDdForms.UNPAUSE_ALL_ENTRYPOINTS:
      return <BgCouncilFormUnpauseAllEntrypoints />
    case BgCounsilDdForms.REMOVE_BREAK_GLASS_CONTROLL:
      return <BgCouncilFormRemoveBreakGlassControl />
    case BgCounsilDdForms.BG_CHANGE_COUNCIL_MEMBER:
      return (
        <BgCouncilFormChangeCouncilMember councilMaxLengths={councilMaxLengths} breakGlassCouncilMembers={members} />
      )

    // mavryk council forms
    case MavrykCounsilDdForms.ADD_VESTEE:
      return <MavCouncilFormAddVestee />
    case MavrykCounsilDdForms.ADD_COUNCIL_MEMBER:
      return <MavCouncilFormAddCouncilMember maxLength={councilMaxLengths} councilMembers={members} />
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
