import { useState } from 'react'

// context
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'

// helpers
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch'
import { convertNumberForClient } from 'utils/calcFunctions'

// queries
import { GET_VAULT_ACC_INT_INDEXES } from '../queries/vaultAccuredInterest.query'

type Args = {
  vaultAddress: string
  shouldSkip?: boolean
}

/**
 * hook to get data for calculating actual accured interest
 *
 * @param vaultAddress – vault's address
 * @param shouldSkip – boolean value whether we need to skip running a query
 * @returns accured interest of the vault, converted to tokens amount
 */
export function useVaultAccuredInterest({ vaultAddress, shouldSkip }: Args) {
  const { handleApolloError } = useApolloContext()

  const [accuredInterest, setAccuredInterest] = useState<number | null>(null)

  useQueryWithRefetch(GET_VAULT_ACC_INT_INDEXES, {
    skip: shouldSkip,
    variables: {
      vaultAddress,
    },
    onCompleted: (data) => {
      const lendingController = data.lending_controller[0]
      const { vaults } = lendingController

      const {
        loan_interest_total,
        borrow_index: vaultBorrowIndex,
        loan_token: {
          borrow_index: tokenBorrowIndex,
          token: {
            metadata: { decimals },
          },
        },
      } = vaults[0]

      // if vault's borrow index <= 0 accured interest is 0
      if (vaultBorrowIndex <= 0 || tokenBorrowIndex <= 0) setAccuredInterest(0)

      const vaultAccuredInterest = convertNumberForClient({
        number: Math.max(0, Math.floor((loan_interest_total * tokenBorrowIndex) / vaultBorrowIndex)),
        grade: decimals,
      })

      setAccuredInterest(vaultAccuredInterest)
    },
    onError: (error) => handleApolloError(error, 'GET_VAULT_ACC_INT_INDEXES'),
  })

  return accuredInterest
}
