import { TokenAddressType } from 'providers/TokensProvider/tokens.provider.types'
import UserProvider from './user.provider'

// Context types
export type UserContext = {
  userTokensBalances: Record<TokenAddressType, number> | null
  updateUserTokenBalances: InstanceType<typeof UserProvider>['updateUserTokenBalances']
}

export type State = {
  context: UserContext
}

export type Props = {
  children: React.ReactNode
}
