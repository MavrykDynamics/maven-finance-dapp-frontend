import { useLocation } from 'react-router-dom'
import qs from 'qs'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// components
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

export const actions = {
  ADD_VESTEE: 'ADD_VESTEE',
  ADD_COUNCIL_MEMBER: 'ADD_COUNCIL_MEMBER',
  UPDATE_VESTEE: 'UPDATE_VESTEE',
  TOGGLE_VESTEE_LOCK: 'TOGGLE_VESTEE_LOCK',
  REMOVE_VESTEE: 'REMOVE_VESTEE',
  CHANGE_COUNCIL_MEMBER: 'CHANGE_COUNCIL_MEMBER',
  REMOVE_COUNCIL_MEMBER: 'REMOVE_COUNCIL_MEMBER',
  TRANSFER_TOKENS: 'TRANSFER_TOKENS',
  REQUEST_TOKENS: 'REQUEST_TOKENS',
  REQUEST_TOKEN_MINT: 'REQUEST_TOKEN_MINT',
  DROP_FINANCIAL_REQUEST: 'DROP_FINANCIAL_REQUEST',
  SET_BAKER: 'SET_BAKER',
  SET_CONTRACT_BAKER: 'SET_CONTRACT_BAKER',
}

export function CouncilForm() {
  const { search } = useLocation()
  const { action } = qs.parse(search, { ignoreQueryPrefix: true })

  const {
    config: { councilMaxLength },
  } = useSelector((state: State) => state.council)

  switch (action) {
    case actions.ADD_VESTEE:
      return <CouncilFormAddVestee />
    case actions.ADD_COUNCIL_MEMBER:
      return <CouncilFormAddCouncilMember {...councilMaxLength} />
    case actions.UPDATE_VESTEE:
      return <CouncilFormUpdateVestee />
    case actions.REMOVE_VESTEE:
      return <CouncilFormRemoveVestee />
    case actions.TOGGLE_VESTEE_LOCK:
      return <CouncilFormToggleVesteeLock />
    case actions.CHANGE_COUNCIL_MEMBER:
      return <CouncilFormChangeCouncilMember {...councilMaxLength} />
    case actions.REMOVE_COUNCIL_MEMBER:
      return <CouncilFormRemoveCouncilMember />
    case actions.TRANSFER_TOKENS:
      return <CouncilFormTransferTokens {...councilMaxLength} />
    case actions.REQUEST_TOKENS:
      return <CouncilFormRequestTokens {...councilMaxLength} />
    case actions.REQUEST_TOKEN_MINT:
      return <CouncilFormRequestTokenMint {...councilMaxLength} />
    case actions.DROP_FINANCIAL_REQUEST:
      return <CouncilFormDropFinancialRequest />
    case actions.SET_BAKER:
      return <CouncilFormSetBaker />
    case actions.SET_CONTRACT_BAKER:
      return <CouncilFormSetContractBaker />

    default:
      return <></>
  }
}
