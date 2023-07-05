import { OpKind, TransferParams } from '@taquito/taquito'
import { unknownToError } from 'errors/error'
import { getEstimationBatchResult, getEstimationResult } from 'errors/helpers/estimateAction.helper'
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

    return await getEstimationResult(delegateMetaData)
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

    return await getEstimationResult(unDelegateMetaData)
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

    return await getEstimationResult(distributeProposalsMetaData)
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

    return await getEstimationBatchResult(tezos, batchArr)
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

    return await getEstimationResult(updateSatelliteMetaData)
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

    return await getEstimationResult(unregisterSatelliteMetaData, callback)
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}
