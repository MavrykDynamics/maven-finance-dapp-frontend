import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { TokenType } from 'utils/TypesAndInterfaces/General'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { MVK_DECIMALS } from 'utils/constants'

// Sign
export const signMavrykAction = async (actionID: number, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.signAction(actionID)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Add Vestee
export const addVestee = async (
  vesteeAddress: string,
  totalAllocated: number,
  cliffInMonths: number,
  vestingInMonths: number,
  counsilAddress: string,
) => {
  try {
    const convertedTotalAllocatedAmount = convertNumberForContractCall({ number: totalAllocated, grade: MVK_DECIMALS })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionAddVestee(
      vesteeAddress,
      convertedTotalAllocatedAmount,
      cliffInMonths,
      vestingInMonths,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Add member
export const addCouncilMember = async (
  newMemberAddress: string,
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
  counsilAddress: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionAddMember(
      newMemberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Update Vestee
export const updateVestee = async (
  vesteeAddress: string,
  totalAllocated: number,
  cliffInMonths: number,
  vestingInMonths: number,
  counsilAddress: string,
) => {
  try {
    const convertedTotalAllocatedAmount = convertNumberForContractCall({ number: totalAllocated, grade: MVK_DECIMALS })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionUpdateVestee(
      vesteeAddress,
      convertedTotalAllocatedAmount,
      cliffInMonths,
      vestingInMonths,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Toggle Vestee Lock
export const toggleVesteeLock = async (vesteeAddress: string, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionToggleVesteeLock(vesteeAddress)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Change Council Member
export const changeMavrykCouncilMember = async (
  oldCouncilMemberAddress: string,
  newCouncilMemberAddress: string,
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
  counsilAddress: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionChangeMember(
      oldCouncilMemberAddress,
      newCouncilMemberAddress,
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Remove Council Member
export const removeCouncilMember = async (memberAddress: string, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionRemoveMember(memberAddress)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Update Council Member Info
export const updateCouncilMemberInfo = async (
  newMemberName: string,
  newMemberWebsite: string,
  newMemberImage: string,
  counsilAddress: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.updateCouncilMemberInfo(
      newMemberName,
      newMemberWebsite,
      newMemberImage,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Transfer Tokens
export const transferTokens = async (
  receiverAddress: string,
  tokenContractAddress: string,
  tokenAmount: number,
  tokenType: TokenType,
  tokenId: number,
  purpose: string,
  decimals: number,
  counsilAddress: string,
) => {
  try {
    const convertedTokensAmount = convertNumberForContractCall({ number: tokenAmount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionTransfer(
      receiverAddress,
      tokenContractAddress,
      convertedTokensAmount,
      tokenType,
      tokenId,
      purpose,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Request Tokens
export const requestTokens = async (
  treasuryAddress: string,
  tokenContractAddress: string,
  tokenName: string,
  tokenAmount: number,
  tokenType: TokenType,
  tokenId: number,
  purpose: string,
  decimals: number,
  counsilAddress: string,
) => {
  try {
    const convertedTokensAmount = convertNumberForContractCall({ number: tokenAmount, grade: decimals })

    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionRequestTokens(
      treasuryAddress,
      tokenContractAddress,
      tokenName,
      convertedTokensAmount,
      tokenType,
      tokenId,
      purpose,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Request Token Mint
export const requestTokenMint = async (
  treasuryAddress: string,
  tokenAmount: number,
  purpose: string,
  counsilAddress: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionRequestMint(
      treasuryAddress,
      convertNumberForContractCall({ number: tokenAmount, grade: MVK_DECIMALS }),
      purpose,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Drop Financial Request
export const dropFinancialRequest = async (financialReqID: string, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionDropFinancialReq(financialReqID)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Remove Vestee Request
export const removeVesteeRequest = async (vesteeAddress: string, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionRemoveVestee(vesteeAddress)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Set Baker Request
export const setBakerRequest = async (bakerHash: string, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionSetBaker(bakerHash)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Set Contract Baker Request
export const setContractBakerRequest = async (
  targetContractAddress: string,
  keyHash: string,
  counsilAddress: string,
) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.councilActionSetContractBaker(
      targetContractAddress,
      keyHash,
    )

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Drop Request
export const dropMavrykCouncilAction = async (actionID: number, counsilAddress: string) => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(counsilAddress)
    const setSingleContractAdminMetaData = contract?.methods.flushAction(actionID)

    return await getEstimationResult(setSingleContractAdminMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
