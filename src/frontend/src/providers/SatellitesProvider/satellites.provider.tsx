import React, { useContext } from 'react'

// types
import { State, Props, SatellitesContext, SatellitesStorage } from './satellites.provider.types'
import { normalizeSatellitesLedger } from './helpers/Satellites.normalizer'

// redux
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { State as ReduxState } from 'reducers'
import { hideToaster, showToaster } from 'app/App.components/Toaster/Toaster.actions'
import {
  ACTION_COMPLETION_MESSAGE_TEXT,
  ACTION_START_MESSAGE_TEXT,
  TOASTER_ERROR,
  TOASTER_INFO,
  TOASTER_LOADING,
  TOASTER_SUCCESS,
  TOASTER_UPDATE_DATA_AFTER_ACTION_DATA,
} from 'app/App.components/Toaster/Toaster.constants'
import { MVK_TOKEN_SYMBOL, SMVK_TOKEN_SYMBOL } from 'utils/constants'
import { DAPP_INSTANCE } from 'app/App.components/ConnectWallet/ConnectWallet.actions'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { checkIndexerLevelAndRunDataUpdateCallback } from 'utils/checkIndexerLevel/checkIndexerLevel'
import { updateUserData } from 'reducers/actions/user.actions'

// context
export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export class SatellitesProviderClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        satelliteMapper: {},
        activeSatellitesIds: [],
        allSatellitesIds: [],
        oraclesIds: [],
        // actions
        updateSatellitesContext: this.updateSatellitesContext,
        // redux actions
        delegate: this.delegate,
        undelegate: this.undelegate,
        distributeProposalRewards: this.distributeProposalRewards,
      },
    }
  }

  // actions
  updateSatellitesContext = (storage: SatellitesStorage, satelliteAddress = '') => {
    const { oraclesIds, activeSatellitesIds, allSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    let _oraclesIds = oraclesIds
    let _activeSatellitesIds = activeSatellitesIds
    let _allSatellitesIds = allSatellitesIds
    let _satelliteMapper = satelliteMapper

    if (Boolean(satelliteAddress)) {
      _oraclesIds = [...new Set([...oraclesIds, ...this.state.context.oraclesIds])]
      _activeSatellitesIds = [...new Set([...activeSatellitesIds, ...this.state.context.activeSatellitesIds])]
      _allSatellitesIds = [...new Set([...allSatellitesIds, ...this.state.context.allSatellitesIds])]

      _satelliteMapper = { ...this.state.context.satelliteMapper, ..._satelliteMapper }
    }

    this.setState({
      context: {
        ...this.state.context,
        oraclesIds: _oraclesIds,
        activeSatellitesIds: _activeSatellitesIds,
        allSatellitesIds: _allSatellitesIds,
        satelliteMapper: _satelliteMapper,
      },
    })
  }

  // redux actions
  delegate = async (satelliteAddress: string) => {
    const wallet = this.props.wallet
    const contractAddresses = this.props.contractAddresses
    const { accountPkh, user } = wallet

    const dispatch = this.props.dispatch

    if (!accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    if (user.userTokens[SMVK_TOKEN_SYMBOL].balance === 0 && user.userTokens[MVK_TOKEN_SYMBOL].balance === 0) {
      dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
      return
    }

    if (user.userTokens[SMVK_TOKEN_SYMBOL].balance === 0) {
      dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please stake your MVK'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
      const transaction = await contract?.methods.delegateToSatellite(accountPkh, satelliteAddress).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Delegating...', ACTION_START_MESSAGE_TEXT))

      // TODO replace timeout with sleep after merge
      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())

            // Add here call for update data actions
            dispatch(hideToaster())
            dispatch(showToaster(TOASTER_SUCCESS, 'Delegation done', ACTION_COMPLETION_MESSAGE_TEXT))
            dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
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

  undelegate = async (delegateAddress: string) => {
    const wallet = this.props.wallet
    const contractAddresses = this.props.contractAddresses
    const { accountPkh } = wallet

    const dispatch = this.props.dispatch

    if (!accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
      const transaction = await contract?.methods.undelegateFromSatellite(accountPkh, delegateAddress).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Undelegating...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        await dispatch(toggleActionFullScreenLoader(false))
        await dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())

            // Add here call for update data actions
            dispatch(hideToaster())
            dispatch(showToaster(TOASTER_SUCCESS, 'Undelegating done', ACTION_COMPLETION_MESSAGE_TEXT))
            dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
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

  distributeProposalRewards = async (satelliteAddress: string, proposals: string[]) => {
    const wallet = this.props.wallet
    const contractAddresses = this.props.contractAddresses
    const { accountPkh, user } = wallet

    const dispatch = this.props.dispatch

    if (!accountPkh) {
      dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    try {
      // prepare and send transaction
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
      const transaction = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals).send()

      dispatch(toggleActionFullScreenLoader(true))
      dispatch(toggleActionCompletion(true))
      dispatch(showToaster(TOASTER_INFO, 'Distributing proposal rewards...', ACTION_START_MESSAGE_TEXT))

      // turn off fs actions loader and start data updating after 5s after operation started
      setTimeout(async () => {
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(
          showToaster(
            TOASTER_LOADING,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
            TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          ),
        )

        // @ts-ignore don't have proper type to acees data, type has only methods
        const currentOperationLevel = transaction?.lastHead?.header?.level

        // refetch data we need
        await checkIndexerLevelAndRunDataUpdateCallback({
          callback: async () => {
            await dispatch(updateUserData())

            // Add here call for update data actions
            dispatch(hideToaster())
            dispatch(showToaster(TOASTER_SUCCESS, 'Distributing proposal rewards done', ACTION_COMPLETION_MESSAGE_TEXT))
            dispatch(toggleActionCompletion(false))
          },
          currentOperationLevel,
        })
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
    // console.log(this.state.context, 'satellites context')
    return <satellitesContext.Provider value={this.state.context}>{this.props.children}</satellitesContext.Provider>
  }
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing Satellites provider')
  }

  return context
}

// redux connect
const mapStateToProps = (state: ReduxState) => ({
  contractAddresses: state.contractAddresses,
  wallet: state.wallet,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
})

export const SatellitesProvider = connect(mapStateToProps, mapDispatchToProps)(SatellitesProviderClass)

export default SatellitesProvider
