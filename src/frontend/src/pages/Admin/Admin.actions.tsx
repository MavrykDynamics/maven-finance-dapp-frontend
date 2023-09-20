// @ts-nocheck
import { State } from '../../reducers'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../providers/ToasterProvider/helpers/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'

import { OpKind } from '@taquito/taquito'
import { DAPP_INSTANCE } from 'providers/UserProvider/user.provider'
import { toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { VaultsContext } from 'providers/VaultsProvider/vaults.provider.types'

export const adminChangeGovernancePeriod =
  (chosenPeriod: string, accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
    console.log('implement due to new logic')
    // const state: State = getState()

    // const {
    //   governance: { config },
    // } = state

    // if (!state.wallet.accountPkh) {
    //   dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    //   return
    // }
    // try {
    //   // const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
    //   // console.log('contract', contract)
    //   //startProposalRound
    //   // let transaction
    //   switch (chosenPeriod) {
    //     case 'PROPOSAL':
    //       //transaction = await contract?.methods.startProposalRound().send()
    //       dispatch({
    //         type: GET_GOVERNANCE_CONFIG,
    //         config: {
    //           ...config,
    //           timelockProposalId: 0,
    //           governancePhase: 'PROPOSAL',
    //         },
    //       })
    //       break
    //     case 'VOTING':
    //       // transaction = await contract?.methods.startVotingRound().send()
    //       dispatch({
    //         type: GET_GOVERNANCE_CONFIG,
    //         config: {
    //           ...config,
    //           governancePhase: 'VOTING',
    //         },
    //       })
    //       break
    //     case 'TIME_LOCK':
    //     default:
    //       //transaction = await contract?.methods.StartTimelockRound().send()
    //       dispatch({
    //         type: GET_GOVERNANCE_CONFIG,
    //         config: {
    //           ...config,
    //           governancePhase: 'TIME_LOCK',
    //         },
    //       })
    //       break
    //   }

    //   dispatch(toggleActionFullScreenLoader(true))

    //   // dispatch(showToaster(INFO, 'Changing Period...', 'Please wait 30s'))

    //   // const done = await transaction?.confirmation()
    //   // console.log('done', done)
    //   dispatch(showToaster(SUCCESS, 'Changing Governance Period done...', 'All good :)'))

    //   dispatch(toggleActionFullScreenLoader(false))
    //   // dispatch(getGovernanceStorage())
    // } catch (error) {
    //   if (error instanceof Error) {
    //     dispatch(showToaster(ERROR, 'Error', error.message))
    //   }
    //   dispatch(toggleActionFullScreenLoader(false))
    // }
  }

export const createFarm = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  // TODO: Change address used to that of the Farm Factory address when possible
  const farmMetadataBase = Buffer.from(
    JSON.stringify({
      name: 'MAVRYK PLENTY-USDTz Farm',
      description: 'MAVRYK Farm Contract',
      version: 'v1.0.0',
      liquidityPairToken: {
        tokenAddress: ['KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu'],
        origin: ['Plenty'],
        token0: {
          symbol: ['PLENTY'],
          tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'],
        },
        token1: {
          symbol: ['USDtz'],
          tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9'],
        },
      },
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex')
  console.log('Farm Metadata: \n', farmMetadataBase)
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.farmFactoryAddress.address)
    console.log('contract', contract)
    const operation = await contract.methods
      .createFarm(
        'PLENTY-USDTz',
        false,
        false,
        true,
        14440,
        100,
        farmMetadataBase,
        'KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu',
        0,
        'fa12',
      )
      .send()
    await operation.confirmation()
    // const transaction = await contract?.methods.createFarm('KT1GAgjxjmbGJMEWTnEJRWNFYAzyE5a2EZwy').send()
    console.log('transaction', operation)
    dispatch(showToaster(INFO, 'Creating Farm...', 'Please wait 30s'))
    const done = await operation?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Tracking Farm done...', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionFullScreenLoader(false))
    }
  }
}

export const ChangeAllAdminsFromGovernance =
  (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }
    // TODO: Change address used to that of the Farm Factory address when possible
    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const govProxyContract = await tezos.wallet.at(state.contractAddresses.governanceAddress.address)
      // const batch = await state.wallet.tezos?.wallet.batch()
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1CvvcXYwAg7dnt5j9uSUcgzso5oyHiYxeQ', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1FFHgu19NB1fbxJy8cDKh55NXtFoX5xhNA', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1FGpHmPmGPQre6CdJWirW54yarAE69AC6v', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1GAPXe8HpcmpGS4UqR7dtTUYttsBe8F21Q', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1SgajykE35iUXNU5oq1v8BPeSWhjBemSts', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1TDWUGcxattXbG4dSawEpGr7EgZNdPF9Ee', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1TGxgh9tRiR3LjS86wqEK2hih57Y1Cnc9Y', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1G3jTf6ULxBVt8Dxo8HfhxZGS2Fwhk8ZJR', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1Hf24mbEZfSsBAQEvpcRQEpYzvqiU4j131', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1NQW18AMX4QqWgR49AcibN2S5oPFzemaqh', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1RAGDtiAvuiXUTsgNkLfr5EPLHz6nbBX9g', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1RVg7kt9g6EFEkEEH68ZbN4dqvMxYnuUG2', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1SCkhFC1pFbu89XvzLf13xvAeBGi4WQNLG', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1HBWFJFjfb6TenbdsvSfeyFjKthhSKs6wf', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      // const batchOp = await batch.send()
      // console.log('Operation hash:', batchOp)
      // await batchOp.confirmation()
      // for (let entry of GENERAL_CONTRACTS) {
      //   // Get contract storage
      //
      //   var genContract = await state.wallet.tezos?.wallet.at(entry.contract_address)
      //   //const breakGlassContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.breakGlassAddress.address)
      //   var storage: any = await genContract.storage()
      //   // Check admins
      //   // var setAdminOperation = await govProxyContract.methods.signAction(i).send()
      //   // const done = await setAdminOperation.confirmation()
      //
      //   if (storage.hasOwnProperty('admin') && storage.admin === state.contractAddresses.governanceProxyAddress.address) {
      //     // console.log('Got to here in if check', state.contractAddresses.governanceProxyAddress.address, entry.contract_address)
      //     // Set admin operation
      //     var setAdminOperation = await govProxyContract.methods.setContractAdmin(entry.contract_address, state.contractAddresses.breakGlassAddress.address).send()
      //     const done = await setAdminOperation.confirmation()
      //     console.log('Changing admin for', entry.contract_address, entry.contract_name)
      //   } else {
      //     const contractAdmin = storage.hasOwnProperty('admin') ? storage.admin : ''
      //     console.log('Contract without govProxyAsAdmin', entry.contract_address, entry.contract_name, contractAdmin)
      //   }
      // }
      //const govProxyContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      const batch = await tezos.wallet
        .batch()
        .withContractCall(
          govProxyContract.methods.setContractAdmin(
            'KT1FFHgu19NB1fbxJy8cDKh55NXtFoX5xhNA',
            'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
          ),
        )
        .withContractCall(
          govProxyContract.methods.setContractAdmin(
            'KT1FGpHmPmGPQre6CdJWirW54yarAE69AC6v',
            'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
          ),
        )
        .withContractCall(
          govProxyContract.methods.setContractAdmin(
            'KT1GAPXe8HpcmpGS4UqR7dtTUYttsBe8F21Q',
            'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
          ),
        )
        .withContractCall(
          govProxyContract.methods.setContractAdmin(
            'KT1SgajykE35iUXNU5oq1v8BPeSWhjBemSts',
            'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
          ),
        )
        .withContractCall(
          govProxyContract.methods.setContractAdmin(
            'KT1TDWUGcxattXbG4dSawEpGr7EgZNdPF9Ee',
            'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
          ),
        )
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1TGxgh9tRiR3LjS86wqEK2hih57Y1Cnc9Y', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1G3jTf6ULxBVt8Dxo8HfhxZGS2Fwhk8ZJR', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1Hf24mbEZfSsBAQEvpcRQEpYzvqiU4j131', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1NQW18AMX4QqWgR49AcibN2S5oPFzemaqh', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1RAGDtiAvuiXUTsgNkLfr5EPLHz6nbBX9g', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1RVg7kt9g6EFEkEEH68ZbN4dqvMxYnuUG2', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1SCkhFC1pFbu89XvzLf13xvAeBGi4WQNLG', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      //   .withContractCall(govProxyContract.methods.setContractAdmin('KT1HBWFJFjfb6TenbdsvSfeyFjKthhSKs6wf', 'KT1Wu7Ww63jXYADFwhXyxvxeSVKKSZKVGY7m'))
      const batchOp = await batch.send()
      console.log('Operation hash:', batchOp)
      await batchOp.confirmation()
      dispatch(showToaster(SUCCESS, 'Changing Admins done...', 'All good :)'))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch(toggleActionFullScreenLoader(false))
      }
    }
  }

export const addAllLoanTokensToMarkets = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  //TODO: Before using this function, ensure that the oracle and mToken addresses are correct
  const allowedLoanTokens = ['usdt', 'tez', 'eurl']
  const oracleAndMTokenIDsMap = new Map<string, { oracleId: string; mTokenId: string }>([
    ['usdt', { oracleId: 'KT1H3UrThDhoDWx3x8BirqxtDFAQDa8MENrX', mTokenId: 'KT1CsED3cRAzpRXA3PwsqhqXa4Qiif9UrBED' }],
    ['tez', { oracleId: 'KT18qwZq87AwmL1orDyhrTBa7fwTnzcCoqKo', mTokenId: 'KT1MxJzA7xoKMT2ZjmFwpFx6ovNWgRqnXg6R' }],
    ['eurl', { oracleId: 'KT1Np2yJNXtAkAeNb3LEVJCD9vtQtRN2vHLE', mTokenId: 'KT18m5XfF9UKYT54uADH2dAZLQt77jrQitfS' }],
  ])
  const batchArray: any = []

  try {
    console.log(state.contractAddresses)
    const tezos = await DAPP_INSTANCE.tezos()
    const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)

    console.log('Here is the contract')
    allowedLoanTokens.forEach((loanToken: string) => {
      const oracleAndMTokenItem = oracleAndMTokenIDsMap.get(loanToken)
      let tokenBatchObject = null
      if (oracleAndMTokenItem !== undefined) {
        tokenBatchObject = createLoanTokenBatchMethodObject(
          contract,
          oracleAndMTokenItem.oracleId,
          oracleAndMTokenItem.mTokenId,
          loanToken,
        )
      }

      console.log('Got to here in function')
      if (tokenBatchObject !== null) batchArray.push(tokenBatchObject)
    })
    if (batchArray.length == 0) {
      dispatch(showToaster(SUCCESS, 'All loan tokens currently added', 'All good :)'))
      return
    }
    const batch = await tezos.wallet.batch(batchArray)
    const transaction = await batch.send()
    // const transaction = await contract?.methods.createFarm('KT1GAgjxjmbGJMEWTnEJRWNFYAzyE5a2EZwy').send()
    // console.log('transaction', transaction)
    dispatch(showToaster(INFO, 'Adding Loan Tokens...', 'Please wait 30s'))
    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Added Missing Loan Tokens...', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionFullScreenLoader(false))
    }
  }
}

function createLoanTokenBatchMethodObject(
  lendingControllerContract: any,
  oracleAddress: string,
  mTokenAddress: string,
  tokenName: string,
) {
  const interestRateDecimals = 27
  let tokenType = null,
    tokenContractAddress = null,
    tokenId = 0
  switch (tokenName) {
    case 'tez':
      tokenType = 'tez'
      break
    case 'usdt':
      tokenType = 'fa2'
      tokenContractAddress = 'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm'
      tokenId = 0
      break
    case 'eurl':
      tokenType = 'fa2'
      tokenContractAddress = 'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5'
      tokenId = 0
      break
  }
  const loanTokenObject = {
    setLoanTokenActionType: 'createLoanToken',
    tokenName: tokenName,
    tokenDecimals: 6,
    oracleAddress: oracleAddress,
    mTokenContractAddress: mTokenAddress,
    reserveRatio: 3000, // 30% reserves (4 decimals)
    optimalUtilisationRate: 30 * 10 ** (interestRateDecimals - 2), // 30% utilisation rate kink
    baseInterestRate: 5 * 10 ** (interestRateDecimals - 2), // 5%
    maxInterestRate: 25 * 10 ** (interestRateDecimals - 2), // 25%
    interestRateBelowOptimalUtilisation: 10 * 10 ** (interestRateDecimals - 2), // 10%
    interestRateAboveOptimalUtilisation: 20 * 10 ** (interestRateDecimals - 2), // 20%
    minRepaymentAmount: 10000,
    tokenType,
    tokenContractAddress: tokenContractAddress,
    tokenId: tokenId,
  }

  if (tokenName == 'tez') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setLoanToken(
          loanTokenObject.setLoanTokenActionType,
          loanTokenObject.tokenName,
          loanTokenObject.tokenDecimals,
          loanTokenObject.oracleAddress,
          loanTokenObject.mTokenContractAddress,
          loanTokenObject.reserveRatio,
          loanTokenObject.optimalUtilisationRate,
          loanTokenObject.baseInterestRate,
          loanTokenObject.maxInterestRate,
          loanTokenObject.interestRateBelowOptimalUtilisation,
          loanTokenObject.interestRateAboveOptimalUtilisation,
          loanTokenObject.minRepaymentAmount,
          loanTokenObject.tokenType,
        )
        .toTransferParams(),
    }
  } else if (tokenName === 'usdt') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setLoanToken(
          loanTokenObject.setLoanTokenActionType,
          loanTokenObject.tokenName,
          loanTokenObject.tokenDecimals,
          loanTokenObject.oracleAddress,
          loanTokenObject.mTokenContractAddress,
          loanTokenObject.reserveRatio,
          loanTokenObject.optimalUtilisationRate,
          loanTokenObject.baseInterestRate,
          loanTokenObject.maxInterestRate,
          loanTokenObject.interestRateBelowOptimalUtilisation,
          loanTokenObject.interestRateAboveOptimalUtilisation,
          loanTokenObject.minRepaymentAmount,
          loanTokenObject.tokenType,
          loanTokenObject.tokenContractAddress,
          loanTokenObject.tokenId,
        )
        .toTransferParams(),
    }
  } else if (tokenName === 'eurl') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setLoanToken(
          loanTokenObject.setLoanTokenActionType,
          loanTokenObject.tokenName,
          loanTokenObject.tokenDecimals,
          loanTokenObject.oracleAddress,
          loanTokenObject.mTokenContractAddress,
          loanTokenObject.reserveRatio,
          loanTokenObject.optimalUtilisationRate,
          loanTokenObject.baseInterestRate,
          loanTokenObject.maxInterestRate,
          loanTokenObject.interestRateBelowOptimalUtilisation,
          loanTokenObject.interestRateAboveOptimalUtilisation,
          loanTokenObject.minRepaymentAmount,
          loanTokenObject.tokenType,
          loanTokenObject.tokenContractAddress,
          loanTokenObject.tokenId,
        )
        .toTransferParams(),
    }
  } else return null
}

export const addAllCollateralTokensToMarkets =
  (avaliableCollaterals: Array<string>, tokensMapper: TokensContext['tokensMetadata']) =>
  async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    //TODO: Before using this function, ensure that the oracle addresses are correct
    const allowedCollaterals = ['usdt', 'tez', 'eurl', 'tzbtc']
    const oracleIDMap = new Map<string, string>([
      ['usdt', 'KT1H3UrThDhoDWx3x8BirqxtDFAQDa8MENrX'],
      ['tez', 'KT18qwZq87AwmL1orDyhrTBa7fwTnzcCoqKo'],
      ['eurl', 'KT1Np2yJNXtAkAeNb3LEVJCD9vtQtRN2vHLE'],
      ['tzbtc', 'KT1AWhMLFpZsKJpM2u3WPZYLzBP9NpyPu6py'],
    ])
    const batchArray: any = []

    try {
      const tezos = await DAPP_INSTANCE.tezos()
      const contract = await tezos.wallet.at(state.contractAddresses.lendingController.address)

      allowedCollaterals.forEach((collateralToken: string) => {
        if (avaliableCollaterals.find((e) => tokensMapper[e].symbol?.toLowerCase() === collateralToken)) {
          const tokenOracleId = oracleIDMap.get(collateralToken) ?? ''
          const tokenBatchObject = createCollateralTokenBatchMethodObject(contract, tokenOracleId, collateralToken)
          if (tokenBatchObject !== null) batchArray.push(tokenBatchObject)
        }
      })

      allowedCollaterals.forEach((collateralToken: string) => {
        const tokenOracleId = oracleIDMap.get(collateralToken) ?? ''
        const tokenBatchObject = createCollateralTokenBatchMethodObject(contract, tokenOracleId, collateralToken)
        if (tokenBatchObject !== null) batchArray.push(tokenBatchObject)
      })

      if (batchArray.length == 0) {
        dispatch(showToaster(SUCCESS, 'All collateral tokens currently added', 'All good :)'))
        return
      }
      console.log(batchArray)
      const batch = await tezos.wallet.batch(batchArray)
      const transaction = await batch.send()
      console.log('transaction', transaction)
      dispatch(showToaster(INFO, 'Adding Collateral Tokens...', 'Please wait 30s'))
      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Added Missing Collateral Tokens...', 'All good :)'))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch(toggleActionFullScreenLoader(false))
      }
    }
  }
const zeroAddress: string = 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg'

function createCollateralTokenBatchMethodObject(
  lendingControllerContract: any,
  oracleAddress: string,
  tokenName: string,
) {
  let tokenType = null,
    tokenContractAddress = null,
    tokenId = 0,
    isScaledToken = false,
    isStakedToken = false,
    stakingContractAddress = null,
    tokenProtected = false
  switch (tokenName) {
    case 'tez':
      tokenType = 'tez'
      tokenContractAddress = zeroAddress
      break
    case 'usdt':
      tokenType = 'fa2'
      tokenContractAddress = 'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm'
      tokenId = 0
      break
    case 'eurl':
      tokenType = 'fa2'
      tokenContractAddress = 'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5'
      tokenId = 0
      break
    case 'tzbtc':
      tokenType = 'fa12'
      tokenContractAddress = 'KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS'
      tokenId = 0
      break
  }
  const collateralTokenObject = {
    setCollateralTokenActionType: 'createCollateralToken',
    tokenName: tokenName,
    tokenContractAddress,
    tokenDecimals: 6,
    oracleAddress: oracleAddress,
    tokenProtected,
    isScaledToken,
    isStakedToken,
    stakingContractAddress,
    maxDepositAmount: null,
    tokenType,
    tokenId,
  }

  if (tokenName == 'tez') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setCollateralToken(
          collateralTokenObject.setCollateralTokenActionType,
          collateralTokenObject.tokenName,
          collateralTokenObject.tokenContractAddress,
          collateralTokenObject.tokenDecimals,
          collateralTokenObject.oracleAddress,
          collateralTokenObject.tokenProtected,
          collateralTokenObject.isScaledToken,
          collateralTokenObject.isStakedToken,
          collateralTokenObject.stakingContractAddress,
          collateralTokenObject.maxDepositAmount,
          collateralTokenObject.tokenType,
          collateralTokenObject.tokenContractAddress,
          collateralTokenObject.tokenId,
        )
        .toTransferParams(),
    }
  } else if (tokenName === 'tzbtc') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setCollateralToken(
          collateralTokenObject.setCollateralTokenActionType,
          collateralTokenObject.tokenName,
          collateralTokenObject.tokenContractAddress,
          collateralTokenObject.tokenDecimals,
          collateralTokenObject.oracleAddress,
          collateralTokenObject.tokenProtected,
          collateralTokenObject.isScaledToken,
          collateralTokenObject.isStakedToken,
          collateralTokenObject.stakingContractAddress,
          collateralTokenObject.maxDepositAmount,
          collateralTokenObject.tokenType,
          collateralTokenObject.tokenContractAddress,
        )
        .toTransferParams(),
    }
  } else if (tokenName === 'usdt' || tokenName === 'eurl') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods
        .setCollateralToken(
          collateralTokenObject.setCollateralTokenActionType,
          collateralTokenObject.tokenName,
          collateralTokenObject.tokenContractAddress,
          collateralTokenObject.tokenDecimals,
          collateralTokenObject.oracleAddress,
          collateralTokenObject.tokenProtected,
          collateralTokenObject.isScaledToken,
          collateralTokenObject.isStakedToken,
          collateralTokenObject.stakingContractAddress,
          collateralTokenObject.maxDepositAmount,
          collateralTokenObject.tokenType,
          collateralTokenObject.tokenContractAddress,
          collateralTokenObject.tokenId,
        )
        .toTransferParams(),
    }
  } else return null
}

export const createTreasuries = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  const rAndDTreasuryData = {
      name: 'Research & Development',
      description: 'MAVRYK Research & Development Treasury Contract',
    },
    investmentTreasuryData = {
      name: 'Investment Fund',
      description: 'MAVRYK Investment Fund Treasury Contract',
    },
    mvkBuyBackTreasuryData = {
      name: 'MVK Buyback for Oracles & Farms',
      description: 'MAVRYK MVK Buyback for Oracles & Farms Treasury Contract',
    },
    daoValidatorFundTreasuryData = {
      name: 'DAO Validator Fund',
      description: 'MAVRYK DAO Validator Fund Treasury Contract',
    }
  // TODO: Change address used to that of the Farm Factory address when possible
  const rAndDTreasuryMetadataBase = Buffer.from(
    JSON.stringify({
      name: rAndDTreasuryData.name,
      description: rAndDTreasuryData.description,
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex')
  const investmentTreasuryMetadataBase = Buffer.from(
    JSON.stringify({
      name: investmentTreasuryData.name,
      description: investmentTreasuryData.description,
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex')
  const mvkBuyBackTreasuryMetadataBase = Buffer.from(
    JSON.stringify({
      name: mvkBuyBackTreasuryData.description,
      description: mvkBuyBackTreasuryData.name,
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex')
  const daoValidatorFundTreasuryMetadataBase = Buffer.from(
    JSON.stringify({
      name: daoValidatorFundTreasuryData.description,
      description: daoValidatorFundTreasuryData.name,
      version: 'v1.0.0',
      authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
    }),
    'ascii',
  ).toString('hex')
  console.log(
    'Treasury Metadata: \n',
    rAndDTreasuryMetadataBase,
    investmentTreasuryMetadataBase,
    mvkBuyBackTreasuryMetadataBase,
    daoValidatorFundTreasuryMetadataBase,
  )
  try {
    const tezos = await DAPP_INSTANCE.tezos()
    console.log(state.contractAddresses.treasuryFactoryAddress.address)
    const contract = await tezos.wallet.at(state.contractAddresses.treasuryFactoryAddress.address)
    console.log('contract', contract)
    const batch = await tezos.wallet
      .batch()
      .withContractCall(contract.methods.createTreasury(null, rAndDTreasuryData.name, true, rAndDTreasuryMetadataBase))
      .withContractCall(
        contract.methods.createTreasury(null, investmentTreasuryData.name, true, investmentTreasuryMetadataBase),
      )
      .withContractCall(
        contract.methods.createTreasury(null, mvkBuyBackTreasuryData.name, true, mvkBuyBackTreasuryMetadataBase),
      )
      .withContractCall(
        contract.methods.createTreasury(
          null,
          daoValidatorFundTreasuryData.name,
          true,
          daoValidatorFundTreasuryMetadataBase,
        ),
      )
    const batchOp = await batch?.send()

    await dispatch(showToaster(INFO, 'Creating Treasuries...', 'Please wait 30s'))

    const done = await batchOp?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Tracking Farm done...', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionFullScreenLoader(false))
    }
  }
}

export const closeAllOfUsersEmptyVaults =
  (vaultsMapper: VaultsContext['vaultsMapper']) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }

    const vaultsArray = Object.keys(vaultsMapper).map(function (vaultId) {
      let vault = vaultsMapper[vaultId]
      // do something with person
      return vault
    })

    const allUsersVaults = getAllEmptyVaultsOfOwner(vaultsArray, state.wallet.accountPkh)
    const batchArray: any = []

    try {
      console.log(state.contractAddresses)
      const tezos = await DAPP_INSTANCE.tezos()
      const lendingControllerContract = await tezos.wallet.at(state.contractAddresses.lendingController.address)

      allUsersVaults.forEach((vault: any) => {
        let closeVaultBatchObject = {
          kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
          ...lendingControllerContract.methods.closeVault(vault.vaultId).toTransferParams(),
        }
        batchArray.push(closeVaultBatchObject)
      })
      console.log(batchArray)
      if (batchArray.length == 0) {
        dispatch(showToaster(SUCCESS, 'User has no empty vaults', 'All good :)'))
        return
      }

      const batch = await tezos.wallet.batch(batchArray)
      const transaction = await batch.send()

      dispatch(showToaster(INFO, "Closing all of User's empty vaults...", 'Please wait 30s'))
      const done = await transaction?.confirmation()
      console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Empty Vaults Closed...', 'All good :)'))
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
        dispatch(toggleActionFullScreenLoader(false))
      }
    }
  }

const getAllEmptyVaultsOfOwner = (vaults: any, usersId: string) => {
  return vaults.filter((vault: any) => {
    const isEmptyVault = vault.borrowedAmount === 0 && vault.fee == 0
    const isUsersVault = vault.ownerId === usersId
    return isEmptyVault && isUsersVault
  })
}
