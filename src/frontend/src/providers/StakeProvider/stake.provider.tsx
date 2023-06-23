import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

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
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'

// TODO move wallet to context to avoid redux logic inside Stake Context
// redux
import { State as ReduxState } from 'reducers'

export const stakeContext = React.createContext<StakeContext>(undefined!)

/** */
export class StakeProviderClass extends React.Component<Props, State> {
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
        updateUserStakeData: this.updateUserStakeData,
        updateTotalMvkToken: this.updateTotalMvkToken,
        stakeMVK: this.stakeMVK,
        unstakeMVK: this.unstakeMVK,
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

  // TODO move wallet from redux to context
  updateUserStakeData = (userData: SubscribeAdressBalanceSubscription) => {
    const { mvk_balance = 0, smvk_balance = 0 } = userData.mavryk_user[0]

    this.props.dispatch({
      type: UPDATE_USER_DATA,
      userData: {
        ...this.props.user,
        userTokens: {
          ...this.props.user.userTokens,
          [MVK_TOKEN_SYMBOL]: {
            ...this.props.user.userTokens[MVK_TOKEN_SYMBOL],
            balance: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }),
          },
          [SMVK_TOKEN_SYMBOL]: {
            ...this.props.user.userTokens[SMVK_TOKEN_SYMBOL],
            balance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
          },
        },
      },
      accountPkh: this.props.accountPkh,
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

  /** */
  render(): React.ReactNode {
    return <stakeContext.Provider value={this.state.context}>{this.props.children}</stakeContext.Provider>
  }
}

const mapStateToProps = (state: ReduxState) => ({
  doormanAddress: state.contractAddresses.doormanAddress.address,
  mvkTokenAddress: state.contractAddresses.mvkTokenAddress.address,
  accountPkh: state.wallet.accountPkh,
  user: state.wallet.user,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
})

export const StakeProvider = connect(mapStateToProps, mapDispatchToProps)(StakeProviderClass)

export const useStakeContext = () => {
  const context = useContext(stakeContext)

  if (!context) {
    throw new Error('StakeContext should be used withing StakeProvider')
  }

  return context
}

export default StakeProvider
