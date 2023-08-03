import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

export type ApolloContext = {
  apolloClient: ApolloClient<NormalizedCacheObject>
}
