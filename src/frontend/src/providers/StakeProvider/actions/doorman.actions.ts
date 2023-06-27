import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { unknownToError } from 'errors/error'
import { convertNumberForContractCall } from 'utils/calcFunctions'

export const stakeMVK = async (
  amount: number,
  accountPkh: string,
  doormanAddress: string,
  mvkTokenAddress: string,
): Promise<{ actionSuccess: boolean; error: null | unknown }> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const mvkTokenContract = await tezos?.wallet.at(mvkTokenAddress)
    const doormanContract = await tezos?.wallet.at(doormanAddress)

    const addOperators = [
        {
          add_operator: {
            owner: accountPkh,
            operator: doormanAddress,
            token_id: 0,
          },
        },
      ],
      removeOperators = [
        {
          remove_operator: {
            owner: accountPkh,
            operator: doormanAddress,
            token_id: 0,
          },
        },
      ]

    const batch =
      mvkTokenContract &&
      doormanContract &&
      (await tezos.wallet
        .batch()
        .withContractCall(mvkTokenContract.methods.update_operators(addOperators))
        .withContractCall(doormanContract.methods.stake(convertNumberForContractCall({ number: amount })))
        .withContractCall(mvkTokenContract.methods.update_operators(removeOperators)))
    await batch?.send()

    return { actionSuccess: true, error: null }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}

export const unstakeMVK = async (
  amount: number,
  doormanAddress: string,
): Promise<{ actionSuccess: boolean; error: null | unknown }> => {
  try {
    // prepare and send transaction
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(doormanAddress)
    await contract?.methods.unstake(convertNumberForContractCall({ number: amount })).send()

    return { actionSuccess: true, error: null }
  } catch (error) {
    return { actionSuccess: false, error: unknownToError(error) }
  }
}
