import { fetchGraphQL } from '../utils/Fetchers/fetchGraphQL'

export async function fetchFromIndexer(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, object | string>,
) {
  return await fetchGraphQL(operationsDoc, operationName, variables)
    .then((res) => {
      const { data, errors } = res as { data: Record<string, object>; errors: Record<string, object> }

      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error) => {
      console.error(error)
      return error
    })
}

export async function fetchFromIndexerWithPromise(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, object | string>,
) {
  return fetchGraphQL(operationsDoc, operationName, variables)
    .then((res) => {
      const { data, errors } = res as { data: Record<string, object>; errors: Record<string, object> }
      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error) => {
      console.error(error)
      return error
    })
}
