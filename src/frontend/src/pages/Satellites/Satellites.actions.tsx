import type { AppDispatch, GetState } from '../../app/App.controller'

export const GET_SATELLITES_STORAGE = 'GET_SATELLITES_STORAGE'
export const getSatellitesStorage = () => async (dispatch: AppDispatch, getState: GetState) => {}

export const GET_SATELLITE_CONFIG = 'GET_SATELLITE_CONFIG'

export const delegate = (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {}

export const undelegate = (delegateAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {}

export const distributeProposalRewards = (a: any, b: any) => async (dispatch: AppDispatch, getState: GetState) => {}

// OLD actions
//   if (!state.wallet.accountPkh) {
//     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//     return
//   }

//   // TODO: those checks will be moved to component where user balances are accessible in satellites update (next pr right after it)
//   // if (
//   //   state.wallet.user.userTokens[SMVK_TOKEN_ADDRESS].balance === 0 &&
//   //   state.wallet.user.userTokens[MVK_TOKEN_SYMBOL].balance === 0
//   // ) {
//   //   dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please buy MVK and stake it'))
//   //   return
//   // }

//   // if (state.wallet.user.userTokens[SMVK_TOKEN_ADDRESS].balance === 0) {
//   //   dispatch(showToaster(TOASTER_ERROR, 'Unable to Delegate', 'Please stake your MVK'))
//   //   return
//   // }

//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)
//     const transaction = await contract?.methods.delegateToSatellite(state.wallet.accountPkh, satelliteAddress).send()

//     dispatch(toggleActionFullScreenLoader(true))
//     dispatch(toggleActionCompletion(true))
//     dispatch(showToaster(TOASTER_INFO, 'Delegating...', ACTION_START_MESSAGE_TEXT))

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
//           await dispatch(getSatellitesStorage())
//           await dispatch(updateUserData())

//           // Add here call for update data actions
//           await dispatch(hideToaster())
//           await dispatch(showToaster(TOASTER_SUCCESS, 'Delegation done', ACTION_COMPLETION_MESSAGE_TEXT))
//           await dispatch(toggleActionCompletion(false))
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

// export const undelegate = (delegateAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {
//   const state: State = getState()

//   if (!state.wallet.accountPkh) {
//     dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//     return
//   }

//   try {
//     // prepare and send transaction
//     const tezos = await DAPP_INSTANCE.tezos()
//     const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)
//     const transaction = await contract?.methods.undelegateFromSatellite(state.wallet.accountPkh, delegateAddress).send()

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
//           await dispatch(getSatellitesStorage())
//           await dispatch(updateUserData())

//           // Add here call for update data actions
//           await dispatch(hideToaster())
//           await dispatch(showToaster(TOASTER_SUCCESS, 'Undelegating done', ACTION_COMPLETION_MESSAGE_TEXT))
//           await dispatch(toggleActionCompletion(false))
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

// export const distributeProposalRewards =
//   (satelliteAddress: string, proposals: string[]) => async (dispatch: AppDispatch, getState: GetState) => {
//     const state: State = getState()

//     if (!state.wallet.accountPkh) {
//       dispatch(showToaster(TOASTER_ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
//       return
//     }

//     try {
//       // prepare and send transaction
//       const tezos = await DAPP_INSTANCE.tezos()
//       const contract = await tezos.wallet.at(state.contractAddresses.delegationAddress.address)
//       const transaction = await contract?.methods.distributeProposalRewards(satelliteAddress, proposals).send()

//       dispatch(toggleActionFullScreenLoader(true))
//       dispatch(toggleActionCompletion(true))
//       dispatch(showToaster(TOASTER_INFO, 'Distributing proposal rewards...', ACTION_START_MESSAGE_TEXT))

//       // turn off fs actions loader and start data updating after 5s after operation started
//       setTimeout(async () => {
//         await dispatch(toggleActionFullScreenLoader(false))
//         await dispatch(
//           showToaster(
//             TOASTER_LOADING,
//             TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
//             TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
//           ),
//         )

//         // @ts-ignore don't have proper type to acees data, type has only methods
//         const currentOperationLevel = transaction?.lastHead?.header?.level
// refetch data we need

//         // refetch data we need
//         await checkIndexerLevelAndRunDataUpdateCallback({
//           callback: async () => {
//             await dispatch(getSatellitesStorage())
//             await dispatch(updateUserData())

//             // Add here call for update data actions
//             await dispatch(hideToaster())
//             await dispatch(
//               showToaster(TOASTER_SUCCESS, 'Distributing proposal rewards done', ACTION_COMPLETION_MESSAGE_TEXT),
//             )
//             await dispatch(toggleActionCompletion(false))
//           },
//           currentOperationLevel,
//         })
//       }, 5000)
//     } catch (error) {
//       if (error instanceof Error) {
//         console.error(error)
//         dispatch(showToaster(TOASTER_ERROR, 'Error', error.message))
//       }
//       dispatch(toggleActionFullScreenLoader(false))
//       dispatch(toggleActionCompletion(false))
//     }
//   }
