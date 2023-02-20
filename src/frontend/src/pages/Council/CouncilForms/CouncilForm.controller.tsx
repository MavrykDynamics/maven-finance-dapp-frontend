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

  return (
    <>
      {actions.ADD_VESTEE === action ? <CouncilFormAddVestee /> : null}
      {actions.ADD_COUNCIL_MEMBER === action ? <CouncilFormAddCouncilMember {...councilMaxLength} /> : null}
      {actions.UPDATE_VESTEE === action ? <CouncilFormUpdateVestee /> : null}
      {actions.REMOVE_VESTEE === action ? <CouncilFormRemoveVestee /> : null}
      {actions.TOGGLE_VESTEE_LOCK === action ? <CouncilFormToggleVesteeLock /> : null}
      {actions.CHANGE_COUNCIL_MEMBER === action ? <CouncilFormChangeCouncilMember {...councilMaxLength} /> : null}
      {actions.REMOVE_COUNCIL_MEMBER === action ? <CouncilFormRemoveCouncilMember /> : null}
      {actions.TRANSFER_TOKENS === action ? <CouncilFormTransferTokens {...councilMaxLength} /> : null}
      {actions.REQUEST_TOKENS === action ? <CouncilFormRequestTokens {...councilMaxLength} /> : null}
      {actions.REQUEST_TOKEN_MINT === action ? <CouncilFormRequestTokenMint {...councilMaxLength} /> : null}
      {actions.DROP_FINANCIAL_REQUEST === action ? <CouncilFormDropFinancialRequest /> : null}
      {actions.SET_BAKER === action ? <CouncilFormSetBaker /> : null}
      {actions.SET_CONTRACT_BAKER === action ? <CouncilFormSetContractBaker /> : null}
    </>
  )
}
