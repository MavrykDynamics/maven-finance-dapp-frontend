import { fetchFromIndexer } from 'gql/fetchGraphQL'
import { INDEXER_LEVEL_QUERY, INDEXER_LEVEL_QUERY_NAME, INDEXER_LEVEL_QUERY_VARIABLES } from './indexerLevel.query'
import { Dipdup_Head } from 'utils/generated/graphqlTypes'

type UpdateDataReturnType = {
  value: unknown | null
}

const MAX_CALLS_AMOUNT = 16

/**
 * @callback - async fn that will load data, when indexer is updated
 * @currentOperationLevel - level of indexer at the moment of operation
 * @returns promise that will rejet error when async callback or indexer fetch return error, max calls exceeded, or operation level missing
 * and return data, that passed callback will return, in case it returns something
 */
export const checkIndexerLevelAndRunDataUpdateCallback = ({
  callback,
  currentOperationLevel,
}: {
  callback: () => Promise<void | unknown>
  currentOperationLevel?: number
}): Promise<UpdateDataReturnType> =>
  new Promise((resolve, reject) => {
    // if no indexer level at operation, we can't compare, return error
    if (!currentOperationLevel) {
      reject(new Error('Data update error, please refresh the page (operation level is missing)'))
    }

    // coun of calls to stop calls indexer when we reached max update calls
    let callsCounter = 0
    const intervalId = setInterval(async () => {
      try {
        // get level from indexer
        const indexerLevelGQL = (await fetchFromIndexer(
          INDEXER_LEVEL_QUERY,
          INDEXER_LEVEL_QUERY_NAME,
          INDEXER_LEVEL_QUERY_VARIABLES,
        )) as { dipdup_head: Array<Dipdup_Head> }

        // as we're getting levels for mainnet and ghostnet, we need to select level for current env, by default use ghostnet
        const indexerLevel = indexerLevelGQL.dipdup_head?.find(
          ({ name }) => name === process.env.REACT_APP_RPC_TZKT_API,
        )?.level

        // TODO: debug log, remove later
        console.info({ indexerLevel, currentOperationLevel, callsCounter })

        // if indexer level in gql > current level in client => update data and clear interval
        if (currentOperationLevel && indexerLevel && indexerLevel - currentOperationLevel >= 2) {
          clearInterval(intervalId)
          const result = await callback()
          resolve({ value: result })
        }

        // if calls are exceeded return error obj and clear interval
        if (callsCounter >= MAX_CALLS_AMOUNT) {
          clearInterval(intervalId)
          reject(new Error('Data update timeout, please refresh page'))
        }

        // increase counter as we runned 1 call
        callsCounter++
      } catch (e) {
        console.log('checkIndexerLevelAndRunDataUpdateCallback error: ', e)
        clearInterval(intervalId)
        reject(new Error('Data update error, please refresh the page'))
      }
    }, 1500)
  })
