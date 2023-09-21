// utils & consts
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'

// types
import { SatelliteGovernanceTransfer } from 'providers/SatellitesProvider/satellites.provider.types'

// Suspend Satellite
export const suspendSatellite = async (
  governanceSatelliteAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const suspendSatelliteMetaData = contract?.methods.suspendSatellite(satelliteAddress, purpose)

    return await getEstimationResult(suspendSatelliteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// commented due to https://www.notion.so/unbanSatellite-a5337dc17bdb452ba4d58851f51b282a?pvs=4
// Unsuspend Satellite
// export const unsuspendSatellite = async (
//   governanceSatelliteAddress: string,
//   satelliteAddress: string,
//   purpose: string,
// ) => {
//   try {
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(governanceSatelliteAddress)
//     const unsuspendSatelliteMetaData = contract?.methods.restoreSatellite(satelliteAddress, purpose)

//     return await getEstimationResult(unsuspendSatelliteMetaData)
//   } catch (error) {
//     const e = unknownToError(error)
//     return { actionSuccess: false, error: new WalletOperationError(e) }
//   }
// }

// Ban Satellite
export const banSatellite = async (governanceSatelliteAddress: string, satelliteAddress: string, purpose: string) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const banSatelliteMetaData = contract?.methods.banSatellite(satelliteAddress, purpose)

    return await getEstimationResult(banSatelliteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// commented due to https://www.notion.so/unbanSatellite-a5337dc17bdb452ba4d58851f51b282a?pvs=4
// Unban Satellite
// export const unbanSatellite = async (governanceSatelliteAddress: string, satelliteAddress: string, purpose: string) => {
//   try {
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(governanceSatelliteAddress)
//     const unbanSatelliteMetaData = contract?.methods.unbanSatellite(satelliteAddress, purpose)

//     return await getEstimationResult(unbanSatelliteMetaData)
//   } catch (error) {
//     const e = unknownToError(error)
//     return { actionSuccess: false, error: new WalletOperationError(e) }
//   }
// }

// Remove all Oracles from Satellite
export const removeOracleFromSatellite = async (
  governanceSatelliteAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const removeOraclesMetaData = contract?.methods.removeAllSatelliteOracles(satelliteAddress, purpose)

    return await getEstimationResult(removeOraclesMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Remove from Aggregator
export const removeOracleInAggregator = async (
  governanceSatelliteAddress: string,
  oracleAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const removeOracleInAggregatorMetaData = contract?.methods.removeOracleInAggregator(
      oracleAddress,
      satelliteAddress,
      purpose,
    )

    return await getEstimationResult(removeOracleInAggregatorMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Add Oracle to Aggregator
export const addOracleToAggregator = async (
  governanceSatelliteAddress: string,
  oracleAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const addOracleToAggregatorMetaData = contract?.methods.addOracleToAggregator(
      oracleAddress,
      satelliteAddress,
      purpose,
    )

    return await getEstimationResult(addOracleToAggregatorMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Set Aggregator Maintainer
export const setAggregatorMaintainer = async (
  governanceSatelliteAddress: string,
  oracleAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const setAggregatorMaintainerMetaData = contract?.methods.setAggregatorMaintainer(
      oracleAddress,
      satelliteAddress,
      purpose,
    )

    return await getEstimationResult(setAggregatorMaintainerMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Drop Action
export const dropAction = async (governanceSatelliteAddress: string, actionId: number, callback?: () => void) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const dropActionMetaData = contract?.methods.dropAction(actionId)

    return await getEstimationResult(dropActionMetaData, {
      callback,
    })
  } catch (error) {
    callback?.()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Vote YES
export const voteForAction = async (
  governanceSatelliteAddress: string,
  actionId: number,
  voteType: string,
  callback?: () => void,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const voteForActionMetaData = contract?.methods.voteForAction(actionId, voteType)

    return await getEstimationResult(voteForActionMetaData, {
      callback,
    })
  } catch (error) {
    callback?.()
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Restore Satellite
export const restoreSatellite = async (
  governanceSatelliteAddress: string,
  satelliteAddress: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const restoreSatelliteMetaData = contract?.methods.restoreSatellite(satelliteAddress, purpose)

    return await getEstimationResult(restoreSatelliteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Update Aggregator Status
export const updateAggregatorStatus = async (
  governanceSatelliteAddress: string,
  aggregatorAddress: string,
  status: string,
  purpose: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const updateAggregatorStatusMetaData = contract?.methods.updateAggregatorStatus(aggregatorAddress, status, purpose)

    return await getEstimationResult(updateAggregatorStatusMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Register Aggregator
export const registerAggregator = async (
  governanceSatelliteAddress: string,
  aggregatorPair: string,
  aggregatorAddress: string,
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const registerAggregatorMetaData = contract?.methods.registerAggregator(aggregatorPair, aggregatorAddress)

    return await getEstimationResult(registerAggregatorMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// Fix Mistaken Transfer
export const fixMistakenTransfer = async (
  governanceSatelliteAddress: string,
  targetContractAddress: string,
  purpose: string,
  transferList: SatelliteGovernanceTransfer[],
) => {
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(governanceSatelliteAddress)
    const fixMistakenTransferMetaData = contract?.methods.fixMistakenTransfer(
      targetContractAddress,
      purpose,
      transferList,
    )

    return await getEstimationResult(fixMistakenTransferMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
