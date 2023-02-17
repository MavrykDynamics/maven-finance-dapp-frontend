import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from 'app/App.components/Toaster/Toaster.constants'
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { State } from 'reducers'
import {
  DELEGATION_STORAGE_QUERY,
  DELEGATION_STORAGE_QUERY_NAME,
  DELEGATION_STORAGE_QUERY_VARIABLE,
  SATELLITES_STORAGE_QUERY,
  SATELLITES_STORAGE_QUERY_NAME,
  SATELLITES_STORAGE_QUERY_VARIABLE,
} from 'gql/queries'
import { fetchFromIndexer } from '../../gql/fetchGraphQL'
import type { AppDispatch, GetState } from '../../app/App.controller'
import { normalizeDelegationStorage, normalizeSatellitesLedger } from './Satellites.helpers'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import { updateUserData } from 'reducers/actions/user.actions'
import { getFinancialRequestStorage } from 'pages/FinacialRequests/FiancialRequest.actions'
import { getFeedsStorage } from 'pages/DataFeeds/DataFeeds.actions'
import { getEmergencyGovernanceStorage } from 'pages/EmergencyGovernance/EmergencyGovernance.actions'
import { getGovernanceStorage } from 'pages/Governance/Governance.actions'
import { governance } from 'reducers/governance'

export const GET_DELEGATION_STORAGE = 'GET_DELEGATION_STORAGE'
export const getDelegationStorage = () => async (dispatch: AppDispatch) => {
  try {
    const delegationStorageFromIndexer = await fetchFromIndexer(
      DELEGATION_STORAGE_QUERY,
      DELEGATION_STORAGE_QUERY_NAME,
      DELEGATION_STORAGE_QUERY_VARIABLE,
    )

    const delegationStorage = normalizeDelegationStorage(delegationStorageFromIndexer?.delegation[0])

    dispatch({
      type: GET_DELEGATION_STORAGE,
      delegationStorage,
    })
  } catch (error) {
    console.error('getDelegationStorage error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const GET_SATELLITES_STORAGE = 'GET_SATELLITES_STORAGE'
export const getSatellitesStorage = () => async (dispatch: AppDispatch, getState: GetState) => {
  const {
    financialRequest: { financialRequests, isLoaded: isFinancialRequestsLoaded },
    dataFeeds: { feedsLedger, isLoaded: isDataFeedsLoaded },
    emergencyGovernance: { eGovProposals, isLoaded: isEgovProposalsLoaded },
    governance: {
      governanceStorage: { proposalLedger },
      pastProposals,
    },
  } = getState()
  try {
    const storage = await fetchFromIndexer(
      SATELLITES_STORAGE_QUERY,
      SATELLITES_STORAGE_QUERY_NAME,
      SATELLITES_STORAGE_QUERY_VARIABLE,
    )

    await Promise.all(
      [
        !isFinancialRequestsLoaded && dispatch(getFinancialRequestStorage()),
        !isDataFeedsLoaded && dispatch(getFeedsStorage()),
        !isEgovProposalsLoaded && dispatch(getEmergencyGovernanceStorage()),
        dispatch(getGovernanceStorage()),
      ].filter(Boolean),
    )

    const normalizedSatellites = normalizeSatellitesLedger(storage, {
      financialRequestLedger: financialRequests,
      feeds: feedsLedger,
      emergencyGovernanceLedger: eGovProposals,
      pastProposals,
      proposalLedger,
    })

    console.log('getSatellitesStorage -> normalizedSatellites:', normalizedSatellites)
  } catch (error) {
    console.error('getSatellitesStorage error: ', error)
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
  }
}

export const delegate = (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  if (state.wallet.user?.myMvkTokenBalance === 0 && state.wallet.user?.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
    return
  }

  if (state.wallet.user?.mySMvkTokenBalance === 0) {
    dispatch(showToaster(ERROR, 'Unable to Delegate', 'Please stake your MVK'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.delegateToSatellite(state.wallet.accountPkh, satelliteAddress).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Delegating...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Delegation done', 'All good :)'))

    await dispatch(getDelegationStorage())
    await dispatch(getDoormanStorage())
    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}

export const undelegate = (delegateAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  if (state.loading.isActionLoading) {
    dispatch(showToaster(ERROR, 'Cannot send transaction', 'Previous transaction still pending...'))
    return
  }

  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.delegationAddress.address)
    const transaction = await contract?.methods.undelegateFromSatellite(state.wallet.accountPkh, delegateAddress).send()

    dispatch(toggleActionLoader(true))
    dispatch(showToaster(INFO, 'Undelegating...', 'Please wait 30s'))

    await transaction?.confirmation()

    dispatch(showToaster(SUCCESS, 'Undelegating done', 'All good :)'))

    await dispatch(getDelegationStorage())
    await dispatch(getDoormanStorage())
    await dispatch(updateUserData())
    await dispatch(toggleActionLoader(false))
  } catch (error) {
    if (error instanceof Error) {
      console.error(error)
      dispatch(showToaster(ERROR, 'Error', error.message))
    }
    dispatch(toggleActionLoader(false))
  }
}
