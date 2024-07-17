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
 * @returns accured interest of the vault, converted to tokens amount
 */
export function useVaultAccuredInterest({ vaultAddress, shouldSkip }: Args) {
  const { handleApolloError } = useApolloContext()

  const [accuredInterest, setAccuredInterest] = useState<number | null>(null)

  // update feeds price and track whether need to load new feed
  useQueryWithRefetch(GET_VAULT_ACC_INT_INDEXES, {
    skip: shouldSkip,
    variables: {
      vaultAddress,
    },
    onCompleted: (data) => {
      const lendingController = data.lending_controller[0]
      const { vaults } = lendingController

      const {
        loan_outstanding_total,
        loan_interest_total,
        loan_principal_total,
        last_updated_block_level,
        borrow_index: vaultBorrowIndex,
        loan_token: {
          borrow_index: tokenBorrowIndex,
          token: {
            metadata: { decimals },
          },
        },
      } = vaults[0]

      // if outstanding total <= 0 or vault's borrow index <= 0 accured interest is 0
      if (loan_outstanding_total <= 0 || vaultBorrowIndex <= 0) {
        setAccuredInterest(0)
      }

      const vaultAccuredInterest = convertNumberForClient({
        number: Math.floor((loan_outstanding_total * tokenBorrowIndex) / vaultBorrowIndex) - loan_principal_total,
        grade: decimals,
      })

      console.log({
        name: data.lending_controller[0]?.vaults?.[0]?.vault?.name,
        vaultAccuredInterest,
      })

      setAccuredInterest(vaultAccuredInterest)
    },
    onError: (error) => handleApolloError(error, 'GET_VAULT_ACC_INT_INDEXES'),
  })

  return accuredInterest
}
