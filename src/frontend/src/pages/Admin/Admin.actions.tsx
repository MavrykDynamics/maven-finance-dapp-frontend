import { State } from '../../reducers'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json'

import { GET_GOVERNANCE_STORAGE, SET_GOVERNANCE_PHASE } from '../Governance/Governance.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'
import {OpKind} from "@taquito/taquito";

export const adminChangeGovernancePeriod =
  (chosenPeriod: string, accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
    const state: State = getState()

    const { governance } = state

    if (!state.wallet.accountPkh) {
      dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
      return
    }
    try {
      // const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
      // console.log('contract', contract)
      //startProposalRound
      // let transaction
      switch (chosenPeriod) {
        case 'PROPOSAL':
          //transaction = await contract?.methods.startProposalRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'PROPOSAL',
          })
          dispatch({
            type: GET_GOVERNANCE_STORAGE,
            governanceStorage: {
              ...governance.governanceStorage,
              timelockProposalId: 0,
            },
          })
          break
        case 'VOTING':
          // transaction = await contract?.methods.startVotingRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'VOTING',
          })
          break
        case 'TIME_LOCK':
        default:
          //transaction = await contract?.methods.StartTimelockRound().send()
          dispatch({
            type: SET_GOVERNANCE_PHASE,
            phase: 'TIME_LOCK',
          })
          break
      }

      dispatch(toggleActionLoader(true))

      // dispatch(showToaster(INFO, 'Changing Period...', 'Please wait 30s'))

      // const done = await transaction?.confirmation()
      // console.log('done', done)
      dispatch(showToaster(SUCCESS, 'Changing Governance Period done...', 'All good :)'))

      dispatch(toggleActionLoader(false))
      // dispatch(getGovernanceStorage())
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, 'Error', error.message))
      }
      dispatch(toggleActionLoader(false))
    }
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
            tokenAddress: ['KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b']
          },
          token1: {
            symbol: ['USDtz'],
            tokenAddress: ['KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9']
          }
        },
        authors: ['MAVRYK Dev Team <contact@mavryk.finance>'],
      }),
      'ascii',
  ).toString('hex')
  console.log('Farm Metadata: \n', farmMetadataBase)
  try {
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.farmFactoryAddress.address)
    console.log('contract', contract)
    const operation = await contract.methods.createFarm(
        "PLENTY-USDTz",
        false,
        false,
        true,
        14440,
        100,
        farmMetadataBase,
        "KT18qSo4Ch2Mfq4jP3eME7SWHB8B8EDTtVBu",
        0,
        "fa12",
    ).send();
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
      dispatch(toggleActionLoader(false))
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
      const govProxyContract = await state.wallet.tezos?.wallet.at(state.contractAddresses.governanceAddress.address)
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
      const batch = await state.wallet.tezos?.wallet
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
        dispatch(toggleActionLoader(false))
      }
    }
  }


export const addAllLoanTokensToMarkets = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  console.log(state.loans.loanTokens)
  const hasUSDT = state.loans.loanTokens.some(e => e.loanTokenData.gqlName === 'usdt')
  const hasTez = state.loans.loanTokens.some(e => e.loanTokenData.gqlName === 'tez')
  const hasEURL = state.loans.loanTokens.some(e => e.loanTokenData.gqlName === 'eurl')
  const batchArray = []

  try {
    console.log(state.contractAddresses)
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
    if (!hasUSDT) {
      const usdtBatchObject = createLoanTokenBatchMethodObject(contract, 'KT1T8qNkrkU4yRMu9s8YbA5GcwiXKak5j4iK', 'KT1AUCdcGBZ7CJmtvVhPKxoC12wtivW9pKgH', 'usdt')
      if (usdtBatchObject !== null) batchArray.push(usdtBatchObject)
    }
    if (!hasTez){
      const tezBatchObject = createLoanTokenBatchMethodObject(contract, 'KT1L2uQvUHnumcd2cVPAiHhSg2zr1npPWvJf', 'KT1CRqkynE2rayCCrapBsbAm7R8nGnsdjBTR', 'tez')
      if (tezBatchObject !== null) batchArray.push(tezBatchObject)
    }
    if (!hasEURL){
      const eurlBatchObject = createLoanTokenBatchMethodObject(contract, 'KT1UsV9auGvp51BkNGBUaoKrtHup6KgWBNYR', 'KT1VVU3CjEBJRxKJQDt5Msc6ps9yZNjmAQFs', 'eurl')
      if (eurlBatchObject !== null) batchArray.push(eurlBatchObject)
    }
    if (batchArray.length == 0) {
      dispatch(showToaster(SUCCESS, 'All loan tokens currently added', 'All good :)'))
      return
    }
    const batch = await state.wallet.tezos?.wallet.batch(batchArray)
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
      dispatch(toggleActionLoader(false))
    }
  }
}

function createLoanTokenBatchMethodObject(lendingControllerContract: any, oracleAddress: string, mTokenAddress: string, tokenName: string) {
  const interestRateDecimals = 27
  let tokenType = null, tokenContractAddress = null, tokenId = 0
  switch (tokenName) {
    case 'tez':
      tokenType = 'tez'
      break;
    case 'usdt':
      tokenType = 'fa12';
      tokenContractAddress = 'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm';
      break;
    case 'eurl':
      tokenType = 'fa2';
      tokenContractAddress = 'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5';
      tokenId = 0;
      break;
  }
  const loanTokenObject = {
    setLoanTokenActionType:"createLoanToken",
    tokenName: tokenName,
    tokenDecimals: 6,
    oracleAddress: oracleAddress,
    mTokenContractAddress: mTokenAddress,
    reserveRatio: 3000, // 30% reserves (4 decimals)
    optimalUtilisationRate: 30 * (10 ** (interestRateDecimals - 2)),// 30% utilisation rate kink
    baseInterestRate: 5  * (10 ** (interestRateDecimals - 2)),  // 5%
    maxInterestRate: 25 * (10 ** (interestRateDecimals - 2)),  // 25%
    interestRateBelowOptimalUtilisation: 10 * (10 ** (interestRateDecimals - 2)),  // 10%
    interestRateAboveOptimalUtilisation: 20 * (10 ** (interestRateDecimals - 2)),  // 20%
    minRepaymentAmount: 10000,
    tokenType,
    tokenContractAddress :tokenContractAddress,
    tokenId: tokenId
  }

  if (tokenName == 'tez') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setLoanToken(
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
          loanTokenObject.tokenType).toTransferParams(),
    }
  } else if (tokenName === 'usdt') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setLoanToken(
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
          loanTokenObject.tokenContractAddress).toTransferParams(),
    }
  } else if (tokenName === 'eurl') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setLoanToken(
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
          loanTokenObject.tokenId).toTransferParams(),
    }
  } else return null
}

export const addAllCollateralTokensToMarkets = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }

  console.log(state.tokens.avaliableCollaterals)
  const hasUSDT = state.tokens.avaliableCollaterals.some(e => e.gqlName === 'usdt')
  const hasTez = state.tokens.avaliableCollaterals.some(e => e.gqlName === 'tez')
  const hasEURL = state.tokens.avaliableCollaterals.some(e => e.gqlName === 'eurl')
  const hasTzBTC = state.tokens.avaliableCollaterals.some(e => e.gqlName === 'tzbtc')
  const batchArray = []

  try {
    console.log(state.contractAddresses)
    const contract = await state.wallet.tezos?.wallet.at(state.contractAddresses.lendingController.address)
    if (!hasUSDT) {
      const usdtBatchObject = createCollateralTokenBatchMethodObject(contract, 'KT1T8qNkrkU4yRMu9s8YbA5GcwiXKak5j4iK', 'usdt')
      if (usdtBatchObject !== null) batchArray.push(usdtBatchObject)
    }
    if (!hasTez){
      const tezBatchObject = createCollateralTokenBatchMethodObject(contract, 'KT1L2uQvUHnumcd2cVPAiHhSg2zr1npPWvJf', 'tez')
      if (tezBatchObject !== null) batchArray.push(tezBatchObject)
    }
    if (!hasEURL){
      const eurlBatchObject = createCollateralTokenBatchMethodObject(contract, 'KT1UsV9auGvp51BkNGBUaoKrtHup6KgWBNYR', 'eurl')
      if (eurlBatchObject !== null) batchArray.push(eurlBatchObject)
    }
    if (!hasTzBTC){
      const tzBTCBatchObject = createCollateralTokenBatchMethodObject(contract, 'KT1GnYkHRiXPnvhctooTjTnF3SABJf13DN3F', 'tzbtc')
      if (tzBTCBatchObject !== null) batchArray.push(tzBTCBatchObject)
    }
    if (batchArray.length == 0) {
      dispatch(showToaster(SUCCESS, 'All collateral tokens currently added', 'All good :)'))
      return
    }
    console.log(batchArray)
    const batch = await state.wallet.tezos?.wallet.batch(batchArray)
    const transaction = await batch.send()
    console.log('transaction', transaction)
    dispatch(showToaster(INFO, 'Adding Collateral Tokens...', 'Please wait 30s'))
    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Added Missing Collateral Tokens...', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionLoader(false))
    }
  }
}
const zeroAddress: string = 'tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg'

function createCollateralTokenBatchMethodObject(lendingControllerContract: any, oracleAddress: string, tokenName: string) {
  let tokenType = null, tokenContractAddress = null, tokenId = 0, isScaledToken = false, isStakedToken= false, stakingContractAddress = null, tokenProtected = false
  switch (tokenName) {
    case 'tez':
      tokenType = 'tez'
      tokenContractAddress = zeroAddress
      break;
    case 'usdt':
      tokenType = 'fa12';
      tokenContractAddress = 'KT1H9hKtcqcMHuCoaisu8Qy7wutoUPFELcLm';
      break;
    case 'eurl':
      tokenType = 'fa2';
      tokenContractAddress = 'KT1UhjCszVyY5dkNUXFGAwdNcVgVe2ZeuPv5';
      tokenId = 0;
      break;
    case 'tzbtc':
      tokenType = 'fa12';
      tokenContractAddress = 'KT1P8RdJ5MfHMK5phKJ5JsfNfask5v2b2NQS';
      tokenId = 0;
      break;
  }
  const collateralTokenObject = {
    setCollateralTokenActionType: "createCollateralToken",
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
    tokenId
  }

  if (tokenName == 'tez') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setCollateralToken(
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
          collateralTokenObject.tokenId).toTransferParams(),
    }
  } else if (tokenName === 'usdt' || tokenName === 'tzbtc') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setCollateralToken(
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
          collateralTokenObject.tokenContractAddress).toTransferParams(),
    }
  } else if (tokenName === 'eurl') {
    return {
      kind: OpKind.TRANSACTION as OpKind.TRANSACTION,
      ...lendingControllerContract.methods.setCollateralToken(
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
          collateralTokenObject.tokenId).toTransferParams(),
    }
  } else return null
}