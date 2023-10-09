import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// Set All Contracts Admin
export const setAllContractsAdmin = async (breakGlassAddress: string, newAdminAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const setAllContractsAdminMetaData = contract?.methods.setAllContractsAdmin(newAdminAddress)

    return await getEstimationResult(setAllContractsAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Set Single Contract Admin
export const setSelectedContractsAdmin = async (
  breakGlassAddress: string,
  newAdminAddress: string,
  targetContracts: Array<string>,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const setSingleContractAdminMetaData = contract?.methods.setContractsAdmin(targetContracts, newAdminAddress)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Sign Action
export const signBreakGlassAction = async (breakGlassActionID: number, breakGlassAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const signActionMetaData = contract?.methods.signAction(breakGlassActionID)

    return await getEstimationResult(signActionMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Add Council Member
export const addCouncilMember = async (
  breakGlassAddress: string,
  memberAddress: string,
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const addCouncilMemberMetaData = contract?.methods.addCouncilMember(
      memberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(addCouncilMemberMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Update Council Member
export const updateBgCouncilMember = async (
  breakGlassAddress: string,
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const updateCouncilMemberMetaData = contract?.methods.updateCouncilMemberInfo(
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(updateCouncilMemberMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Change Council Member
export const changeBgCouncilMember = async (
  breakGlassAddress: string,
  oldCouncilMemberAddress: string,
  newCouncilMemberAddress: string,
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const changeCouncilMemberMetaData = contract?.methods.changeCouncilMember(
      oldCouncilMemberAddress,
      newCouncilMemberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(changeCouncilMemberMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Remove Council Member
export const removeCouncilMember = async (councilAddress: string, memberAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(councilAddress)
    const removeCouncilMemberMetaData = contract?.methods.councilActionRemoveMember(memberAddress)

    return await getEstimationResult(removeCouncilMemberMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Propagate Break Glass
export const propagateBreakGlass = async (breakGlassAddress: string, govContracts: Array<string>) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const propagateBreakGlassMetaData = contract?.methods.propagateBreakGlass(govContracts)

    return await getEstimationResult(propagateBreakGlassMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Drop Action
export const dropBreakGlassCouncilAction = async (breakGlassActionID: number, breakGlassAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const dropBreakGlassMetaData = contract?.methods.flushAction(breakGlassActionID)

    return await getEstimationResult(dropBreakGlassMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Unpause All Entrypoints
export const unpauseAllEntrypoints = async (breakGlassAddress: string, contracts: Array<string>) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const setSingleContractAdminMetaData = contract?.methods.unpauseAllEntrypoints(contracts)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// TODO: create form and use action, when design will be ready
// Remove Break Glass Controll
export const removeBreakGlassControl = async (breakGlassAddress: string, contracts: Array<string>) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const setSingleContractAdminMetaData = contract?.methods.removeBreakGlassControl(contracts)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
