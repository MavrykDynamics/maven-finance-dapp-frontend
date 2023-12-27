// consts
import { BgCouncilDdForms, MavenCouncilDdForms } from '../helpers/council.consts'

// types
import { CouncilContext } from 'providers/CouncilProvider/council.provider.types'
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// break glass council forms components
import { BgCouncilFormSetSelectedContractsAdmin } from './BreakGlassCouncilForms/BgCouncilFormSetSelectedContractsAdmin'
import { BgCouncilFormAddCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormAddCouncilMember'
import { BgCouncilFormChangeCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormChangeCouncilMember'
import { BgCouncilFormRemoveCouncilMember } from './BreakGlassCouncilForms/BgCouncilFormRemoveCouncilMember'
import { BgCouncilFormUnpauseAllEntrypoints } from './BreakGlassCouncilForms/BgCouncilFormUnpauseAllEntrypoints'
import { BgCouncilFormRemoveBreakGlassControl } from './BreakGlassCouncilForms/BgCouncilFormRemoveBreakGlassControl'

// maven council forms components
import { MavCouncilFormAddVestee } from './MavenCouncilForms/MavCouncilFormAddVestee'
import { MavCouncilFormAddCouncilMember } from './MavenCouncilForms/MavCouncilFormAddCouncilMember'
import { MavCouncilFormUpdateVestee } from './MavenCouncilForms/MavCouncilFormUpdateVestee'
import { MavCouncilFormRemoveVestee } from './MavenCouncilForms/MavCouncilFormRemoveVestee'
import { MavCouncilFormToggleVesteeLock } from './MavenCouncilForms/MavCouncilFormToggleVesteeLock'
import { MavCouncilFormChangeCouncilMember } from './MavenCouncilForms/MavCouncilFormChangeCouncilMember'
import { MavCouncilFormRemoveCouncilMember } from './MavenCouncilForms/MavCouncilFormRemoveCouncilMember'
import { MavCouncilFormTransferTokens } from './MavenCouncilForms/MavCouncilFormTransferTokens'
import { MavCouncilFormRequestTokens } from './MavenCouncilForms/MavCouncilFormRequestTokens'
import { MavCouncilFormRequestTokenMint } from './MavenCouncilForms/MavCouncilFormRequestTokenMint'
import { MavCouncilFormDropFinancialRequest } from './MavenCouncilForms/MavCouncilFormDropFinancialRequest'
import { MavCouncilFormSetBaker } from './MavenCouncilForms/MavCouncilFormSetBaker'
import { MavCouncilFormSetContractBaker } from './MavenCouncilForms/MavCouncilFormSetContractBaker'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
  members: CouncilContext['breakGlassCouncilMembers']
}

export const CouncilForms = ({ councilMaxLengths, selectedAction, members }: Props) => {
  switch (selectedAction) {
    // break glass council forms
    case BgCouncilDdForms.SET_MULTIPLE_CONTRACTS_ADMIN:
      return <BgCouncilFormSetSelectedContractsAdmin />
    case BgCouncilDdForms.BG_ADD_COUNCIL_MEMBER:
      return <BgCouncilFormAddCouncilMember maxLength={councilMaxLengths} breakGlassCouncilMembers={members} />
    case BgCouncilDdForms.BG_REMOVE_COUNCIL_MEMBER:
      return <BgCouncilFormRemoveCouncilMember breakGlassCouncilMembers={members} />
    case BgCouncilDdForms.UNPAUSE_ALL_ENTRYPOINTS:
      return <BgCouncilFormUnpauseAllEntrypoints />
    case BgCouncilDdForms.REMOVE_BREAK_GLASS_CONTROL:
      return <BgCouncilFormRemoveBreakGlassControl />
    case BgCouncilDdForms.BG_CHANGE_COUNCIL_MEMBER:
      return (
        <BgCouncilFormChangeCouncilMember councilMaxLengths={councilMaxLengths} breakGlassCouncilMembers={members} />
      )

    // maven council forms
    case MavenCouncilDdForms.ADD_VESTEE:
      return <MavCouncilFormAddVestee />
    case MavenCouncilDdForms.ADD_COUNCIL_MEMBER:
      return <MavCouncilFormAddCouncilMember maxLength={councilMaxLengths} councilMembers={members} />
    case MavenCouncilDdForms.UPDATE_VESTEE:
      return <MavCouncilFormUpdateVestee />
    case MavenCouncilDdForms.REMOVE_VESTEE:
      return <MavCouncilFormRemoveVestee />
    case MavenCouncilDdForms.TOGGLE_VESTEE_LOCK:
      return <MavCouncilFormToggleVesteeLock />
    case MavenCouncilDdForms.CHANGE_COUNCIL_MEMBER:
      return <MavCouncilFormChangeCouncilMember councilMaxLengths={councilMaxLengths} councilMembers={members} />
    case MavenCouncilDdForms.REMOVE_COUNCIL_MEMBER:
      return <MavCouncilFormRemoveCouncilMember councilMembers={members} />
    case MavenCouncilDdForms.TRANSFER_TOKENS:
      return <MavCouncilFormTransferTokens {...councilMaxLengths} />
    case MavenCouncilDdForms.REQUEST_TOKENS:
      return <MavCouncilFormRequestTokens {...councilMaxLengths} />
    case MavenCouncilDdForms.REQUEST_TOKEN_MINT:
      return <MavCouncilFormRequestTokenMint {...councilMaxLengths} />
    case MavenCouncilDdForms.DROP_FINANCIAL_REQUEST:
      return <MavCouncilFormDropFinancialRequest />
    case MavenCouncilDdForms.SET_BAKER:
      return <MavCouncilFormSetBaker />
    case MavenCouncilDdForms.SET_CONTRACT_BAKER:
      return <MavCouncilFormSetContractBaker />
    default:
      return null
  }
}
