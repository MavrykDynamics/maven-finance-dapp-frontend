// types
import { DappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider.types'

// consts
import { MavrykCounsilDdForms } from '../helpers/mavrykCouncil.consts'

// view
import { CouncilFormAddVestee } from './CouncilFormAddVestee.view'
import { CouncilFormAddCouncilMember } from './CouncilFormAddCouncilMember.view'
import { CouncilFormUpdateVestee } from './CouncilFormUpdateVestee.view'
import { CouncilFormRemoveVestee } from './CouncilFormRemoveVestee.view'
import { CouncilFormToggleVesteeLock } from './CouncilFormToggleVesteeLock.view'
import { CouncilFormChangeCouncilMember } from './CouncilFormChangeCouncilMember.view'
import { CouncilFormRemoveCouncilMember } from './CouncilFormRemoveCouncilMember.view'
import { CouncilFormTransferTokens } from './CouncilFormTransferTokens.view'
import { CouncilFormRequestTokens } from './CouncilFormRequestTokens.view'
import { CouncilFormRequestTokenMint } from './CouncilFormRequestTokenMint.view'
import { CouncilFormDropFinancialRequest } from './CouncilFormDropFinancialRequest.view'
import { CouncilFormSetBaker } from './CouncilFormSetBaker.view'
import { CouncilFormSetContractBaker } from './CouncilFormSetContractBaker.view'

type Props = {
  councilMaxLengths: DappConfigContext['maxLengths']['council']
  selectedAction?: string
}

export function CouncilForm({ councilMaxLengths, selectedAction }: Props) {
  switch (selectedAction) {
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
      return <CouncilFormChangeCouncilMember {...councilMaxLengths} />
    case MavrykCounsilDdForms.REMOVE_COUNCIL_MEMBER:
      return <CouncilFormRemoveCouncilMember />
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
