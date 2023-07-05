import { OpKind, TransferParams } from '@taquito/taquito'
import { unknownToError } from 'errors/error'
import { estimateBatchOperation, estimateExecution } from 'errors/helpers/walletError.helper'
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { RegisterAsSatelliteForm } from 'utils/TypesAndInterfaces/Forms'

export const delegate = async (
  satelliteAddress: string,
  delegationAddress: string,
  accountPkh: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  //   if (!state.wallet.accountPkh) {
  //     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //     return
  //   }

  //   if (
  //     state.wallet.user.userTokens[SMVK_TOKEN_SYMBOL].balance === 0 &&
  //     state.wallet.user.userTokens[MVK_TOKEN_SYMBOL].balance === 0
  //   ) {
  //     dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
  //     return
  //   }

  //   if (state.wallet.user.userTokens[SMVK_TOKEN_SYMBOL].balance === 0) {
  //     dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please stake your MVK'))
  //     return
  //   }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const delegateMetaData = await contract?.methods.delegateToSatellite(accountPkh, satelliteAddress)

    const op = await estimateExecution(delegateMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await delegateMetaData.send()
    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const undelegate = async (
  delegateToAddress: string,
  delegationAddress: string,
  accountPkh: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // if (!state.wallet.accountPkh) {
  //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const unDelegateMetaData = await contract?.methods.undelegateFromSatellite(accountPkh, delegateToAddress)

    const op = await estimateExecution(unDelegateMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await unDelegateMetaData.send()
    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const distributeProposalRewards = async (
  delegationAddress: string,
  satelliteAddress: string,
  proposals: string[],
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // if (!state.wallet.accountPkh) {
  //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const distributeProposalsMetaData = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals)

    const op = await estimateExecution(distributeProposalsMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await distributeProposalsMetaData.send()
    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

// become satellite actions
export const registerSatellite = async (
  accountPkh: string,
  form: RegisterAsSatelliteForm,
  delegationAddress: string,
  userDelegatedToAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // if (!state.wallet.accountPkh) {
  //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

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

    // Estimating Operations for the batch call
    const estimateBatchOp = await estimateBatchOperation(batchArr)

    if (estimateBatchOp.error) {
      return { actionSuccess: false, error: estimateBatchOp.error }
    }

    const operation = await tezos.wallet.batch(batchArr).send()

    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const updateSatellite = async (
  form: RegisterAsSatelliteForm,
  delegationAddress: string,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // if (!state.wallet.accountPkh) {
  //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

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

    const op = await estimateExecution(updateSatelliteMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await updateSatelliteMetaData.send()
    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const unregisterSatellite = async (
  delegationAddress: string,
  accountPkh: string,
  callback: () => void,
): Promise<ActionErrorReturnType | ActionSuccessReturnType> => {
  // if (!state.wallet.accountPkh) {
  //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
  //   return
  // }

  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(delegationAddress)
    const unregisterSatelliteMetaData = await contract?.methods.unregisterAsSatellite(accountPkh)

    const op = await estimateExecution(unregisterSatelliteMetaData)

    if (op?.error) {
      return { actionSuccess: false, error: op.error }
    }

    const operation = await unregisterSatelliteMetaData.send()

    callback()
    return { actionSuccess: true, operation }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}
