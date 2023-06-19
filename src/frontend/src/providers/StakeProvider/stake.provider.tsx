import React, { useContext } from 'react'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'
import { unknownToError } from 'errors/error'

import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeMvkTokenTotalSubscription,
  SubscribeAdressBalanceSubscription,
} from 'utils/__generated__/graphql'

// types
import { State, Props, StakeContext } from './stake.provider.types'

// consts
import { MVK_DECIMALS } from 'utils/constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

export const stakeContext = React.createContext<StakeContext>(undefined!)

/** */
export class StakeProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        action: '',
        updateStakeActionContext: this.updateStakeActionContext,
        loadingToasterId: null,
        updateStakeLoadingToasterId: this.updateStakeLoadingToasterId,

        totalStakedMvk: 0,
        totalSupply: 0,
        maximumTotalSupply: 0,
        mvkHistoryData: [],
        smvkHistoryData: [],
        updateStakeHistoryData: this.updateStakeHistoryData,
        updateTotalStakedMvk: this.updateTotalStakedMvk,
        updateTotalMvkToken: this.updateTotalMvkToken,
        stakeMVK: this.stakeMVK,
        unstakeMVK: this.unstakeMVK,
        getMVKTokensFromFaucet: this.getMVKTokensFromFaucet,
      },
    }
  }

  updateStakeActionContext = (newAction: StakeContext['action']) => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        action: newAction,
      },
    }))
  }

  updateStakeLoadingToasterId = (newLoaderToasterId: StakeContext['loadingToasterId']) => {
    this.setState((prevState) => ({
      context: {
        ...prevState.context,
        loadingToasterId: newLoaderToasterId,
      },
    }))
  }

  updateStakeHistoryData = (smvkStorage: SubscribeSmvkHistoryDataSubscription) => {
    const { smvk_history_data } = smvkStorage
    const { smvkHistoryData, mvkHistoryData } = normalizeDoormanChartsData({ smvk_history_data })

    this.setState({
      context: {
        ...this.state.context,
        smvkHistoryData,
        mvkHistoryData,
      },
    })
  }

  updateTotalStakedMvk = (storage: SubscribeAdressBalanceSubscription) => {
    this.setState({
      context: {
        ...this.state.context,
        totalStakedMvk: convertNumberForClient({
          number: storage.mavryk_user[0].mvk_balance ?? 0,
          grade: MVK_DECIMALS,
        }),
      },
    })
  }

  updateTotalMvkToken = (storage: SubscribeMvkTokenTotalSubscription) => {
    const {
      mvk_token: [mvkTokenItem],
    } = storage

    this.setState({
      context: {
        ...this.state.context,
        totalSupply: convertNumberForClient({ number: mvkTokenItem.total_supply ?? 0, grade: MVK_DECIMALS }),
        maximumTotalSupply: convertNumberForClient({ number: mvkTokenItem.maximum_supply ?? 0, grade: MVK_DECIMALS }),
      },
    })
  }

  // ACTIONS
  stakeMVK = async (
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

  unstakeMVK = async (amount: number, doormanAddress: string) => {
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

  // TODO: update action as stake / unstake
  getMVKTokensFromFaucet = async (mvkFaucetAddress: string | null) => {
    // const { accountPkh, dispatch, user } = this.props

    // check whether we can send transaction
    // if (!mvkFaucetAddress) {
    //   dispatch(showToaster(TOASTER_ERROR, 'Cannot send transaction', 'No faucet address provided'))
    //   return
    // }

    // check whether we can send transaction
    // if (!accountPkh) {
    //   dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    //   return
    // }

    // if (user.userTokens[MVK_TOKEN_SYMBOL].balance > 0 || user.userTokens[SMVK_TOKEN_ADDRESS].balance > 0) {
    //   dispatch(
    //     showToaster(
    //       TOASTER_ERROR,
    //       'You have already claimed MVK',
    //       'You are unable to claim MVK, you have already claimed',
    //     ),
    //   )
    //   return
    // }

    try {
      // prepare and send transaction
      // const tezos = await DAPP_INSTANCE.tezos()
      // const contract = await tezos.wallet.at(mvkFaucetAddress)
      // await contract.methods.requestMvk().send()
      // this.updateStakeActionContext(GET_MVK_FROM_FAUCET_ACTION)
      // dispatch(await actionStartToaster(GET_MVK_FROM_FAUCET_ACTION))
    } catch (error) {
      // if (error instanceof Error) {
      //   console.error(error)
      //   dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      // }
      // dispatch(toggleActionFullScreenLoader(false))
      // dispatch(toggleActionCompletion(false))
    }
  }

  /** */
  render(): React.ReactNode {
    return <stakeContext.Provider value={this.state.context}>{this.props.children}</stakeContext.Provider>
  }
}

export const useStakeContext = () => {
  const context = useContext(stakeContext)

  if (!context) {
    throw new Error('StakeContext should be used withing StakeProvider')
  }

  return context
}

export default StakeProvider
