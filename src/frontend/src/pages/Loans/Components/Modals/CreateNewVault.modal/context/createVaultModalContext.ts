import { createContext, useContext } from 'react'
import { CreateVaultModalContext } from '../helpers/createNewVault.types'

export const createVaultModalContext = createContext<CreateVaultModalContext>(undefined!)

export const useCreateVaultContext = () => {
  const context = useContext(createVaultModalContext)

  if (!context) {
    throw new Error('useCreateVaultContext should be used within CreateVaultProvider')
  }

  return context
}
