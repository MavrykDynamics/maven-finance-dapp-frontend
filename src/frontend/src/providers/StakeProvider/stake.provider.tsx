import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'

import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeAdressBalanceSubscription,
  SubscribeMvkTokenTotalSubscription,
} from 'utils/__generated__/graphql'

// types
import { State, Props, StakeContext } from './stake.provider.types'

// consts
import { TOASTER_ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { GET_MVK_FROM_FAUCET_ACTION, STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'

// TODO move wallet to context to avoid redux logic inside Stake Context
// redux
import { State as ReduxState } from 'reducers'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  actionEndToaster,
  actionStartToaster,
} from 'app/App.components/Toaster/builtActions/actions-helpers.notifications'

export const stakeContext = React.createContext<StakeContext>(undefined!)

export class StakeProviderClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        action: '',
        totalStakedMvk: 0,
        totalSupply: 0,
        maximumTotalSupply: 0,
        mvkHistoryData: [],
        smvkHistoryData: [],
        turnOfActionLoader: false,
        updateStakeHistoryData: this.updateStakeHistoryData,
        updateTotalStakedMvk: this.updateTotalStakedMvk,
        updateUserStakeData: this.updateUserStakeData,
        updateStakeActionContext: this.updateStakeActionContext,
        updateTotalMvkToken: this.updateTotalMvkToken,
        updateStakeActionLoaderContext: this.updateStakeActionLoaderContext,
        stakeMVK: this.stakeMVK,
        unstakeMVK: this.unstakeMVK,
        getMVKTokensFromFaucet: this.getMVKTokensFromFaucet,
      },
    }
  }

  // Used only for action, on it's completion to turn of loading toaster and show success toaster
  componentDidUpdate(): void {
    if (this.state.context.turnOfActionLoader && this.state.context.action) {
      this.props.dispatch(actionEndToaster(this.state.context.action))
      this.updateStakeActionContext('')
      this.updateStakeActionLoaderContext(false)
    }
  }

  updateStakeActionContext = (newAction: StakeContext['action']) => {
    this.setState({
      context: {
        ...this.state.context,
        action: newAction,
      },
    })
  }

  updateStakeActionLoaderContext = (newLoaderValue: boolean) => {
    this.setState({
      context: {
        ...this.state.context,
        turnOfActionLoader: newLoaderValue,
      },
    })
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
  stakeMVK = async (amount: number) => {
    const { accountPkh, dispatch, doormanAddress, mvkTokenAddress } = this.props

    // check whether we can send transaction
    if (!this.props.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (!(amount > 0)) {
      dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
      return
    }

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

      this.updateStakeActionContext(STAKE_ACTION)
      dispatch(actionStartToaster(STAKE_ACTION))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

  unstakeMVK = async (amount: number) => {
    const { dispatch, doormanAddress } = this.props

    // check whether we can send transaction
    if (!this.props.accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (!(amount > 0)) {
      dispatch(showToaster(TOASTER_ERROR, 'Incorrect amount', 'Please enter an amount superior to zero'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(doormanAddress)
      await contract?.methods.unstake(convertNumberForContractCall({ number: amount })).send()

      this.updateStakeActionContext(UNSTAKE_ACTION)
      dispatch(actionStartToaster(UNSTAKE_ACTION))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

  getMVKTokensFromFaucet = async (mvkFaucetAddress: string | null) => {
    const { accountPkh, dispatch, user } = this.props

    // check whether we can send transaction
    if (!mvkFaucetAddress) {
      dispatch(showToaster(TOASTER_ERROR, 'Cannot send transaction', 'No faucet address provided'))
      return
    }

    // check whether we can send transaction
    if (!accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (user.userTokens[MVK_TOKEN_SYMBOL].balance > 0 || user.userTokens[SMVK_TOKEN_SYMBOL].balance > 0) {
      dispatch(
        showToaster(
          TOASTER_ERROR,
          'You have already claimed MVK',
          'You are unable to claim MVK, you have already claimed',
        ),
      )
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(mvkFaucetAddress)
      await contract.methods.requestMvk().send()

      this.updateStakeActionContext(GET_MVK_FROM_FAUCET_ACTION)
      dispatch(actionStartToaster(GET_MVK_FROM_FAUCET_ACTION))
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
      }
      dispatch(toggleActionFullScreenLoader(false))
      dispatch(toggleActionCompletion(false))
    }
  }

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
