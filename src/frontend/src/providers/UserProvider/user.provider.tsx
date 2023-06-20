import React, { useContext } from 'react'

// consts

// helpers

// types
import { UserContext, State, Props } from './user.provider.types'

export const userContext = React.createContext<UserContext>(undefined!)

/** */
export class UserProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      context: {
        userTokensBalances: null,
        updateUserTokenBalances: this.updateUserTokenBalances,
      },
    }
  }

  updateUserTokenBalances = (newUserTokensBalances: UserContext['userTokensBalances']) => {
    console.log({ newUserTokensBalances })

    this.setState({
      context: {
        ...this.state.context,
        userTokensBalances: newUserTokensBalances
          ? {
              ...this.state.context.userTokensBalances,
              ...newUserTokensBalances,
            }
          : null,
      },
    })
  }

  /** */
  render(): React.ReactNode {
    return <userContext.Provider value={this.state.context}>{this.props.children}</userContext.Provider>
  }
}

export const useUserContext = () => {
  const context = useContext(userContext)

  if (!context) {
    throw new Error('userContext should be used withing User provider')
  }

  return context
}

export default UserProvider
