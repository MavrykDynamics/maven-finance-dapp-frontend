import { OpKind, TransferParams } from '@mavrykdynamics/taquito'
import { WalletOperationError, unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { UserContext } from 'providers/UserProvider/user.provider.types'
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
  userProposalRewards: NonNullable<UserContext['rewards']>['availableProposalRewards'],
  delegateToAddress: string,
  delegationAddress: string,
  governanceAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)

    const batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[] = []

    if (userProposalRewards.length) {
      const govContract = await tezos.wallet.at(governanceAddress)

      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...govContract?.methods.distributeProposalRewards(delegateToAddress, userProposalRewards).toTransferParams(),
      })
    }

    batchArr.push({
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods.undelegateFromSatellite(accountPkh, delegateToAddress).toTransferParams(),
    })

    return await getEstimationBatchResult(tezos, batchArr)
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
  userProposalRewards: NonNullable<UserContext['rewards']>['availableProposalRewards'],
  delegationAddress: string,
  governanceAddress: string,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)

    const batchArr: (TransferParams & { kind: OpKind.TRANSACTION })[] = []

    if (userProposalRewards.length) {
      const govContract = await tezos.wallet.at(governanceAddress)

      batchArr.push({
        kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
        ...govContract?.methods.distributeProposalRewards(accountPkh, userProposalRewards).toTransferParams(),
      })
    }

    batchArr.push({
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...contract?.methods.unregisterAsSatellite(accountPkh).toTransferParams(),
    })

    return await getEstimationBatchResult(tezos, batchArr, callback)
  } catch (error) {
    const e = unknownToError(error)
    return { actionSuccess: false, error: new WalletOperationError(e) }
  }
}
