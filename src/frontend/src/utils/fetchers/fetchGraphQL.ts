import { api } from './api'
import { DIP_DUP_HEAD_QUERY, DIP_DUP_HEAD_QUERY_NAME } from 'gql/queries/dipdup'

// types
import { DipDupGraphQLResponse } from 'types/dipDup.type'

export const fetchGraphQL = (() => {
  const { NODE_ENV, REACT_APP_DEV_GRAPHQL_API, REACT_APP_BACKUP_GRAPHQL_API, REACT_APP_GRAPHQL_API } = process.env
  const developmentAPI = REACT_APP_DEV_GRAPHQL_API ?? ''
  const productionAPI = REACT_APP_GRAPHQL_API ?? ''
  let gqlAPINetwork = NODE_ENV === 'development' ? developmentAPI : productionAPI

  return async (
    operationsDoc: string,
    operationName: string,
    variables: Record<string, object | string>,
    apiError = false,
  ) => {
    try {
      const { data: dipdDupData } = await api<DipDupGraphQLResponse>(gqlAPINetwork, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: DIP_DUP_HEAD_QUERY,
          operationName: DIP_DUP_HEAD_QUERY_NAME,
        }),
      })

      const { data, code, status } = await api<any>(gqlAPINetwork, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: operationsDoc,
          variables: variables,
          operationName: operationName,
        }),
      })

      if (
        !apiError &&
        (dipdDupData.data.dipdup_head_status[0].status.toLowerCase() !== 'ok' || (code === 500 && status === 'ok'))
      ) {
        gqlAPINetwork = REACT_APP_BACKUP_GRAPHQL_API ?? ''
        await fetchGraphQL(operationsDoc, operationName, variables, true)
      }

      return data
    } catch (e) {
      throw e
    }
  }
})()
