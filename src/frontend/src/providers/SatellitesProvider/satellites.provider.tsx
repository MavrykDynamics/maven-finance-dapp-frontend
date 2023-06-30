import React, { useContext, useMemo, useState } from 'react'

// types
import { SatellitesContext, SatellitesCtxState } from './satellites.provider.types'
import { normalizeSatellitesLedger } from './helpers/satellites.normalizer'

// redux
import { ApolloError, useSubscription } from '@apollo/client'
import { getSatelliteDataSubscription } from './queries/satellites.query'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { TOASTER_TEXTS } from 'app/App.components/Toaster/texts/toaster.texts'
import { TOASTER_SUBSCRIPTION_ERROR } from 'providers/ToasterProvider/toaster.provider.const'
import { SatelliteDataSubSubscription } from 'utils/__generated__/graphql'
import {
  EXECUTED_PROPOSALS_AMOUNT_SUBSCRIPTION,
  E_GOV_PROPOSALS_AMOUNT_SUBSCRIPTION,
  FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION,
  PROPOSALS_AMOUNT_SUBSCRIPTION,
} from './queries/satellitesMetricsData.query'

// context
export const satellitesContext = React.createContext<SatellitesContext>(undefined!)

export type Props = {
  children: React.ReactNode
}

export const SatellitesProvider = ({ children }: Props) => {
  const { bug } = useToasterContext()

  const [satellitesCtxState, setSatellitesCtxState] = useState<SatellitesCtxState>({
    satelliteMapper: {},
    activeSatellitesIds: [],
    allSatellitesIds: [],
    oraclesIds: [],
    eGovProposalsAmount: 0,
    executedProposalAmount: 0,
    proposalsAmount: 0,
    finRequestsAmount: 0,
  })

  const [satelliteAddressToSubsctibe, setSatelliteAddressToSubsctibe] = useState<null | string>(null)

  const handleSubError = (e: ApolloError) => {
    console.error('SUBSCRIPTION_STAKE_HISTORY query error: ', { e })
    bug(TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['message'], TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
  }

  const { loading: satellitesLoading } = useSubscription(getSatelliteDataSubscription(satelliteAddressToSubsctibe), {
    variables: {
      userAddress: satelliteAddressToSubsctibe,
    },
    onData: ({ data: { data } }) => {
      if (!data) return
      updateSatellitesContext(data)
    },
    onError: handleSubError,
    shouldResubscribe: true,
  })

  const { loading: proposalsAmountLoading } = useSubscription(PROPOSALS_AMOUNT_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        proposalsAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: handleSubError,
    shouldResubscribe: true,
  })

  const { loading: executedProposalsAmountLoading } = useSubscription(EXECUTED_PROPOSALS_AMOUNT_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        executedProposalAmount: data.governance_proposal_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: handleSubError,
    shouldResubscribe: true,
  })

  const { loading: finRequestsAmountLoading } = useSubscription(FINANCIAL_REQUESTS_AMOUNT_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        finRequestsAmount: data.governance_financial_request_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: handleSubError,
    shouldResubscribe: true,
  })

  const { loading: eGovProposalsAmountLoading } = useSubscription(E_GOV_PROPOSALS_AMOUNT_SUBSCRIPTION, {
    onData: ({ data: { data } }) => {
      if (!data) return
      setSatellitesCtxState((prev) => ({
        ...prev,
        eGovProposalsAmount: data.emergency_governance_aggregate.aggregate?.count ?? 0,
      }))
    },
    onError: handleSubError,
    shouldResubscribe: true,
  })

  // actions
  const updateSatellitesContext = (storage: SatelliteDataSubSubscription) => {
    const { oraclesIds, activeSatellitesIds, allSatellitesIds, satelliteMapper } = normalizeSatellitesLedger(storage)

    setSatellitesCtxState((prev) => ({
      ...prev,
      satelliteMapper,
      activeSatellitesIds,
      allSatellitesIds,
      oraclesIds,
    }))
  }

  const memoSatellitesContext = useMemo(() => {
    return {
      ...satellitesCtxState,
      isLoading:
        satellitesLoading ||
        proposalsAmountLoading ||
        executedProposalsAmountLoading ||
        finRequestsAmountLoading ||
        eGovProposalsAmountLoading,
      setSatelliteAddressToSubsctibe,
    }
  }, [
    eGovProposalsAmountLoading,
    executedProposalsAmountLoading,
    finRequestsAmountLoading,
    proposalsAmountLoading,
    satellitesCtxState,
    satellitesLoading,
  ])

  return <satellitesContext.Provider value={memoSatellitesContext}>{children}</satellitesContext.Provider>
}

export const useSatellitesContext = () => {
  const context = useContext(satellitesContext)

  if (!context) {
    throw new Error('satellitesContext should be used withing Satellites provider')
  }

  return context
}

export default SatellitesProvider

// redux actions
// delegate = async (satelliteAddress: string) => {
//   const wallet = this.props.wallet
//   const contractAddresses = this.props.contractAddresses
//   const { accountPkh, user } = wallet

//   const dispatch = this.props.dispatch

//   if (!accountPkh) {
//     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//     return
//   }

//   if (user.userTokens[SMVK_TOKEN_ADDRESS].balance === 0 && user.userTokens[MVK_TOKEN_SYMBOL].balance === 0) {
//     dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
//     return
//   }

//   if (user.userTokens[SMVK_TOKEN_ADDRESS].balance === 0) {
//     dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please stake your MVK'))
//     return
//   }

//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
//     const transaction = await contract?.methods.delegateToSatellite(accountPkh, satelliteAddress).send()

//     dispatch(toggleActionFullScreenLoader(true))
//     dispatch(toggleActionCompletion(true))
//     dispatch(showToaster(TOASTER_INFO, 'Delegating...', ACTION_START_MESSAGE_TEXT))

//     // TODO replace timeout with sleep after merge
//     // turn off fs actions loader and start data updating after 5s after operation started
//     setTimeout(async () => {
//       dispatch(toggleActionFullScreenLoader(false))
//       dispatch(
//         showToaster(
//           TOASTER_LOADING,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
//         ),
//       )

//       // @ts-ignore don't have proper type to acees data, type has only methods
//       const currentOperationLevel = transaction?.lastHead?.header?.level

//       // refetch data we need
//       await checkIndexerLevelAndRunDataUpdateCallback({
//         callback: async () => {
//           await dispatch(updateUserData())

//           // Add here call for update data actions
//           dispatch(hideToaster())
//           dispatch(showToaster(TOASTER_SUCCESS, 'Delegation done', ACTION_COMPLETION_MESSAGE_TEXT))
//           dispatch(toggleActionCompletion(false))
//         },
//         currentOperationLevel,
//       })
//     }, 5000)
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(error)
//       dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
//     }
//     dispatch(toggleActionFullScreenLoader(false))
//     dispatch(toggleActionCompletion(false))
//   }
// }

// undelegate = async (delegateAddress: string) => {
//   const wallet = this.props.wallet
//   const contractAddresses = this.props.contractAddresses
//   const { accountPkh } = wallet

//   const dispatch = this.props.dispatch

//   if (!accountPkh) {
//     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//     return
//   }

//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
//     const transaction = await contract?.methods.undelegateFromSatellite(accountPkh, delegateAddress).send()

//     dispatch(toggleActionFullScreenLoader(true))
//     dispatch(toggleActionCompletion(true))
//     dispatch(showToaster(TOASTER_INFO, 'Undelegating...', ACTION_START_MESSAGE_TEXT))

//     // turn off fs actions loader and start data updating after 5s after operation started
//     setTimeout(async () => {
//       await dispatch(toggleActionFullScreenLoader(false))
//       await dispatch(
//         showToaster(
//           TOASTER_LOADING,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
//         ),
//       )

//       // @ts-ignore don't have proper type to acees data, type has only methods
//       const currentOperationLevel = transaction?.lastHead?.header?.level

//       // refetch data we need
//       await checkIndexerLevelAndRunDataUpdateCallback({
//         callback: async () => {
//           await dispatch(updateUserData())

//           // Add here call for update data actions
//           dispatch(hideToaster())
//           dispatch(showToaster(TOASTER_SUCCESS, 'Undelegating done', ACTION_COMPLETION_MESSAGE_TEXT))
//           dispatch(toggleActionCompletion(false))
//         },
//         currentOperationLevel,
//       })
//     }, 5000)
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(error)
//       dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
//     }
//     dispatch(toggleActionFullScreenLoader(false))
//     dispatch(toggleActionCompletion(false))
//   }
// }

// distributeProposalRewards = async (satelliteAddress: string, proposals: string[]) => {
//   const wallet = this.props.wallet
//   const contractAddresses = this.props.contractAddresses
//   const { accountPkh, user } = wallet

//   const dispatch = this.props.dispatch

//   if (!accountPkh) {
//     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//     return
//   }

//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(contractAddresses.delegationAddress.address)
//     const transaction = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals).send()

//     dispatch(toggleActionFullScreenLoader(true))
//     dispatch(toggleActionCompletion(true))
//     dispatch(showToaster(TOASTER_INFO, 'Distributing proposal rewards...', ACTION_START_MESSAGE_TEXT))

//     // turn off fs actions loader and start data updating after 5s after operation started
//     setTimeout(async () => {
//       dispatch(toggleActionFullScreenLoader(false))
//       dispatch(
//         showToaster(
//           TOASTER_LOADING,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
//           TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
//         ),
//       )

//       // @ts-ignore don't have proper type to acees data, type has only methods
//       const currentOperationLevel = transaction?.lastHead?.header?.level

//       // refetch data we need
//       await checkIndexerLevelAndRunDataUpdateCallback({
//         callback: async () => {
//           await dispatch(updateUserData())

//           // Add here call for update data actions
//           dispatch(hideToaster())
//           dispatch(showToaster(TOASTER_SUCCESS, 'Distributing proposal rewards done', ACTION_COMPLETION_MESSAGE_TEXT))
//           dispatch(toggleActionCompletion(false))
//         },
//         currentOperationLevel,
//       })
//     }, 5000)
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(error)
//       dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
//     }
//     dispatch(toggleActionFullScreenLoader(false))
//     dispatch(toggleActionCompletion(false))
//   }
// }
