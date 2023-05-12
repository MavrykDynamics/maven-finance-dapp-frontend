import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'

import {
  SubscribeSmvkHistoryDataSubscription,
  SubscribeAdressBalanceSubscription,
  SubscribeDoormanAddressBalanceSubscription,
  SubscribeMvkTokenTotalSubscription,
} from 'utils/__generated__/graphql'

// types
import { State, Props, StakeContext } from './stake.provider.types'

// consts
import {
  TOASTER_ERROR,
  TOASTER_INFO,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_LOADING,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
  ACTION_COMPLETION_MESSAGE_TEXT,
  TOASTER_SUCCESS,
} from 'app/App.components/Toaster/Toaster.constants'
import { STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'

// TODO move wallet to context to avoid redux logic inside Stake Context
// redux
import { State as ReduxState } from 'reducers'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'

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
      },
    }
  }

  componentDidUpdate(): void {
    console.log({ ctx: this.state.context })
    if (this.state.context.turnOfActionLoader) {
      this.props.dispatch(hideToaster())
      this.props.dispatch(
        showToaster(
          TOASTER_SUCCESS,
          `${this.state.context.action.charAt(0).toUpperCase() + this.state.context.action.substring(1)} done`,
          ACTION_COMPLETION_MESSAGE_TEXT,
        ),
      )
      this.props.dispatch(toggleActionCompletion(false))
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

  updateTotalStakedMvk = (storage: SubscribeDoormanAddressBalanceSubscription) => {
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
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Staking...', ACTION_START_MESSAGE_TEXT))

      // show toaster loader after 5000ms after operation started
      const loadingTimeoutId = setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )
        clearTimeout(loadingTimeoutId)
      }, 5000)
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
      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Unstaking...', ACTION_START_MESSAGE_TEXT))

      // show toaster loader after 5000ms after operation started
      const loadingTimeoutId = setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )
        clearTimeout(loadingTimeoutId)
      }, 5000)
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
