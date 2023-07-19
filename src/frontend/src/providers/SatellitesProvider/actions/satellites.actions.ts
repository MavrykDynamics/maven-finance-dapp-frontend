import { OpKind, TransferParams } from '@taquito/taquito'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { RegisterAsSatelliteForm } from 'utils/TypesAndInterfaces/Forms'

export const delegate = async (
  accountPkh: string,
  satelliteAddress: string,
  delegationAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const delegateMetaData = await contract?.methods.delegateToSatellite(accountPkh, satelliteAddress)

    return await getEstimationResult(delegateMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const undelegate = async (
  accountPkh: string,
  delegateToAddress: string,
  delegationAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const unDelegateMetaData = await contract?.methods.undelegateFromSatellite(accountPkh, delegateToAddress)

    return await getEstimationResult(unDelegateMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const distributeProposalRewards = async (
  delegationAddress: string,
  satelliteAddress: string,
  proposals: string[],
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const distributeProposalsMetaData = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals)

    return await getEstimationResult(distributeProposalsMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

// become satellite actions
export const registerSatellite = async (
  accountPkh: string,
  form: RegisterAsSatelliteForm,
  delegationAddress: string,
  userDelegatedToAddress: string | null,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)

    const batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[] = []

    if (userDelegatedToAddress) {
      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...contract?.methods.undelegateFromSatellite(accountPkh, userDelegatedToAddress).toTransferParams(),
      })
    }

    batchArr.push({
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods
        .registerAsSatellite(
          form.name,
          form.description,
          form.image,
          form.website,
          form.fee * 100,
          form.publicKey,
          form.peerId,
        )
        .toTransferParams(),
    })

    return await getEstimationBatchResult(tezos, batchArr)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const updateSatellite = async (
  form: RegisterAsSatelliteForm,
  delegationAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const updateSatelliteMetaData = await contract?.methods.updateSatelliteRecord(
      form.name,
      form.description,
      form.image,
      form.website,
      form.fee * 100,
      form.publicKey,
      form.peerId,
    )

    return await getEstimationResult(updateSatelliteMetaData)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}

export const unregisterSatellite = async (
  accountPkh: string,
  delegationAddress: string,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const unregisterSatelliteMetaData = await contract?.methods.unregisterAsSatellite(accountPkh)

    return await getEstimationResult(unregisterSatelliteMetaData, { callback })
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
