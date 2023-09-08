import { ApolloClient, ApolloError, NormalizedCacheObject } from '@apollo/client'

export type ApolloContext = {
  apolloClient: ApolloClient<NormalizedCacheObject>
  handleApolloError: (error: ApolloError, subName: string, bugMessage?: string) => void
}
