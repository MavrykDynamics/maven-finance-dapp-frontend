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
export const setSingleContractAdmin = async (
  breakGlassAddress: string,
  newAdminAddress: string,
  targetContract: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const setSingleContractAdminMetaData = contract?.methods.setSingleContractAdmin(newAdminAddress, targetContract)

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
  callback: () => void,
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

    return await getEstimationResult(updateCouncilMemberMetaData, {
      callback,
    })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Change Council Member
export const changeCouncilMember = async (
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
export const removeCouncilMember = async (breakGlassAddress: string, memberAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const removeCouncilMemberMetaData = contract?.methods.removeCouncilMember(memberAddress)

    return await getEstimationResult(removeCouncilMemberMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Propagate Break Glass
export const propagateBreakGlass = async (breakGlassAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(breakGlassAddress)
    const propagateBreakGlassMetaData = contract?.methods.propagateBreakGlass()

    return await getEstimationResult(propagateBreakGlassMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Drop Action
export const dropBreakGlass = async (breakGlassActionID: number, breakGlassAddress: string) => {
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
