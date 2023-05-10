import React, { useContext } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

// helpers
import { normalizeDoormanChartsData } from './helpers/normalizer'
import { convertNumberForClient } from 'utils/calcFunctions'

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
import { MVK_DECIMALS } from 'utils/constants'

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
        myMvkTokenBalance: convertNumberForClient({ number: mvk_balance, grade: MVK_DECIMALS }),
        mySMvkTokenBalance: convertNumberForClient({ number: smvk_balance, grade: MVK_DECIMALS }),
      },
      accountPkh: this.props.accountPkh,
    })
  }

  render(): React.ReactNode {
    return <stakeContext.Provider value={this.state.context}>{this.props.children}</stakeContext.Provider>
  }
}

const mapStateToProps = (state: ReduxState) => ({
  doormanAddress: state.contractAddresses,
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
