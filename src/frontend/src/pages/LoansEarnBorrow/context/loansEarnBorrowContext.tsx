import React from 'react'

export type LoansEarnBorrowContext = {
  isChartsLoading: boolean
}

export const loansEarnBorrowContext = React.createContext<LoansEarnBorrowContext>(undefined!)

export const useLoansEarnBorrowContext = () => {
  const context = React.useContext(loansEarnBorrowContext)

  if (!context) {
    throw new Error('useLoansEarnBorrowContext should be used within LoansEarnBorrowProvider')
  }

  return context
}
