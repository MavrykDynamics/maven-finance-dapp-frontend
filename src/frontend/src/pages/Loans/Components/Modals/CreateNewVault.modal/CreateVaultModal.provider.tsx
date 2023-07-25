import React, { useMemo, useState } from 'react'
import { createVaultModalContext } from './helpers/createVaultModalContext'
import {
  CreateVaultModalState,
  NewVaultType,
  ScreenType,
  SelectedCollateralsType,
  VaultInputState,
} from './helpers/createNewVault.types'
import { DEFAULT_CREATE_VAULT_STATE } from './helpers/createNewVault.consts'

type Props = {
  children: React.ReactNode
}

export const CreateVaultModalProvider = ({ children }: Props) => {
  const [modalState, setModalState] = useState<CreateVaultModalState>(DEFAULT_CREATE_VAULT_STATE)

  const resetCreateVaultModalState = () => {
    setModalState(DEFAULT_CREATE_VAULT_STATE)
  }

  const updateScreenToShow = (screenId: ScreenType) => {
    setModalState((prev) => ({
      ...prev,
      screenToShow: screenId,
    }))
  }

  const updateInputVaultState = (vaultData: Partial<VaultInputState>) => {
    setModalState((prev) => ({
      ...prev,
      vault: { ...prev.vault, ...vaultData },
    }))
  }

  const updateVaultCreating = (value: boolean) => {
    setModalState((prev) => ({
      ...prev,
      isVaultCreating: value,
    }))
  }

  const updateNewVault = (newVault: NewVaultType) => {
    setModalState((prev) => ({
      ...prev,
      newVault,
    }))
  }

  const updateSelectedCollaterals = (selectedCollaterals: SelectedCollateralsType) => {
    setModalState((prev) => ({
      ...prev,
      selectedCollaterals,
      selectedCollateralsAddresses: Object.keys(selectedCollaterals),
    }))
  }

  const ctx = useMemo(
    () => ({
      ...modalState,
      resetCreateVaultModalState,
      updateScreenToShow,
      updateInputVaultState,
      updateVaultCreating,
      updateNewVault,
      updateSelectedCollaterals,
    }),
    [modalState],
  )

  return <createVaultModalContext.Provider value={ctx}>{children}</createVaultModalContext.Provider>
}
