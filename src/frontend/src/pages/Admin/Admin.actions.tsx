import { State } from '../../reducers'
import { showToaster } from '../../app/App.components/Toaster/Toaster.actions'
import { ERROR, INFO, SUCCESS } from '../../app/App.components/Toaster/Toaster.constants'
import type { AppDispatch, GetState } from '../../app/App.controller'
import farmFactoryAddress from '../../deployments/farmFactoryAddress.json'

import { GET_GOVERNANCE_STORAGE, SET_GOVERNANCE_PHASE } from '../Governance/Governance.actions'
import { toggleActionLoader } from 'app/App.components/Loader/Loader.action'

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

export const trackFarm = (accountPkh?: string) => async (dispatch: AppDispatch, getState: GetState) => {
  const state: State = getState()

  if (!state.wallet.accountPkh) {
    dispatch(showToaster(ERROR, 'Please connect your wallet', 'Click Connect in the left menu'))
    return
  }
  // TODO: Change address used to that of the Farm Factory address when possible
  try {
    const contract = await state.wallet.tezos?.wallet.at(farmFactoryAddress.address)
    console.log('contract', contract)
    const transaction = await contract?.methods.trackFarm('KT1GAgjxjmbGJMEWTnEJRWNFYAzyE5a2EZwy').send()
    console.log('transaction', transaction)
    dispatch(showToaster(INFO, 'Tracking Farm...', 'Please wait 30s'))
    const done = await transaction?.confirmation()
    console.log('done', done)
    dispatch(showToaster(SUCCESS, 'Tracking Farm done...', 'All good :)'))
  } catch (error) {
    if (error instanceof Error) {
      dispatch(showToaster(ERROR, 'Error', error.message))
      dispatch(toggleActionLoader(false))
    }
  }
}

const GENERAL_CONTRACTS = [
  {
    contract_address: 'KT1CgyjH7BPhk4nma5SmE7xgYjreWr1y1vq8',
    contract_name: 'emergencyGovernance',
  },
  {
    contract_address: 'KT1Jsb7wSRNuF9rqR74K23fP8ta1wUH28c7U',
    contract_name: 'doorman',
  },
  {
    contract_address: 'KT1W3a9rVBQu8f1Jr5RvzRxCXauy3MJQtKhH',
    contract_name: 'delegation',
  },
  {
    contract_address: 'KT1GdqT3Kw278HkFuwTHeaJGC3FxCu5YRVTT',
    contract_name: 'breakGlass',
  },
  {
    contract_address: 'KT1RQH5Nwwxs7hUqXX57LVc312LC4muvTC58',
    contract_name: 'council',
  },
  {
    contract_address: 'KT1RuqJfxdresBfKQkNEDt7no76gcWEe88hZ',
    contract_name: 'vesting',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'lendingTreasury',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'taxTreasury',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'farmTreasury',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'paymentTreasury',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'satelliteTreasury',
  },
  {
    contract_address: 'KT1QWk4f39jGHBEx6uUwwPgcd8TYNrznsGyg',
    contract_name: 'aggregatorTreasury',
  },
  {
    contract_address: 'KT1JZwikNu2wzU94snXjLcTKcpf3tymGnWoY',
    contract_name: 'farmFactory',
  },
  {
    contract_address: 'KT1FgJLzorzNPQtVhwH5UPzUJA3BJJNAVUGD',
    contract_name: 'treasuryFactory',
  },
  {
    contract_address: 'KT1FwvvhZfEgWWihbEpcbVHDZ4grvS3UdxSg',
    contract_name: 'aggregatorFactory',
  },
  {
    contract_address: 'KT1DkGCHHMDrVC9V4YeKf8sDSoRVtDXGKhEE',
    contract_name: 'governanceSatellite',
  },
  {
    contract_address: 'KT1DHj4hewsGaa2vpLYKDMmXrXENmnfQKapY',
    contract_name: 'governanceFinancial',
  },
  {
    contract_address: 'KT1De3nsKNtJ4cRpxYYsh2TNsbNM4q8arC2n',
    contract_name: 'tokenPoolReward',
  },
  {
    contract_address: 'KT1Xsguyd57ToGudw9YiPVozYsGUSTaJBkXU',
    contract_name: 'vaultFactory',
  },
  {
    contract_address: 'KT1RVg7kt9g6EFEkEEH68ZbN4dqvMxYnuUG2',
    contract_name: 'USDXTZ',
  },
  {
    contract_address: 'KT1BFi2cBrd4uWcWMFyK9JNk3AqR91a6CU2V',
    contract_name: 'USDDOGE',
  },
  {
    contract_address: 'KT1HBWFJFjfb6TenbdsvSfeyFjKthhSKs6wf',
    contract_name: 'treasuryInteraction',
  },
  {
    contract_address: 'KT1Hf24mbEZfSsBAQEvpcRQEpYzvqiU4j131',
    contract_name: 'USDBTC',
  },
  {
    contract_address: 'KT1X32FdE4udzReNM55cG5ShTM6McaLdM6z8',
    contract_name: 'lendingControllerMockTime',
  },
  {
    contract_address: 'KT1X32FdE4udzReNM55cG5ShTM6McaLdM6z8',
    contract_name: 'lendingController',
  },
  {
    contract_address: 'KT1NQW18AMX4QqWgR49AcibN2S5oPFzemaqh',
    contract_name: 'USD/BTC',
  },
  {
    contract_address: 'KT1G3jTf6ULxBVt8Dxo8HfhxZGS2Fwhk8ZJR',
    contract_name: 'USD/USDT',
  },
]
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
