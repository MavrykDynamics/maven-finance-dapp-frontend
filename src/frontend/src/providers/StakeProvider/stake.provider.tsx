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

// TODO move wallet to context to avoid redux logic inside Stake Context
// redux
import { State as ReduxState } from 'reducers'
import { UPDATE_USER_DATA } from 'reducers/actions/user.actions'
import { MVK_DECIMALS, MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionFullScreenLoader, toggleActionCompletion } from 'app/App.components/Loader/Loader.action'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  TOASTER_ERROR,
  TOASTER_INFO,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_LOADING,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { STAKE_ACTION, UNSTAKE_ACTION } from './helpers/stake.consts'

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
        updateStakeHistoryData: this.updateStakeHistoryData,
        updateTotalStakedMvk: this.updateTotalStakedMvk,
        updateUserStakeData: this.updateUserStakeData,
        updateStakeActionContext: this.updateStakeActionContext,
        updateTotalMvkToken: this.updateTotalMvkToken,
        stakeMVK: this.stakeMVK,
        unstakeMVK: this.unstakeMVK,
      },
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

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Staking...', ACTION_START_MESSAGE_TEXT))

      // show toaster loader after 5000ms after operation started
      setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        this.updateStakeActionContext(STAKE_ACTION)
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

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Unstaking...', ACTION_START_MESSAGE_TEXT))

      // show toaster loader after 5000ms after operation started
      setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        this.updateStakeActionContext(UNSTAKE_ACTION)
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
