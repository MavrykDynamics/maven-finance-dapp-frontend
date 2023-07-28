import React, { useMemo, useState } from 'react'
import { createVaultModalContext } from './createVaultModalContext'
import {
  CreateNewModalProps,
  CreateVaultModalState,
  NewVaultType,
  ScreenType,
  SelectedCollateralsType,
  VaultInputState,
} from '../helpers/createNewVault.types'
import { DEFAULT_CREATE_VAULT_STATE } from '../helpers/createNewVault.consts'
import { getTokenDataByAddress, isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type Props = CreateNewModalProps & {
  children: React.ReactNode
}

export const CreateVaultModalProvider = ({ closePopup, show, data, children }: Props) => {
  const { tokensPrices, tokensMetadata } = useTokensContext()
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
      vaultInputState: { ...prev.vaultInputState, ...vaultData },
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
      newVault: { id: 148, address: 'KT1UCFPPgutMkkt3xBpSyAxH6piRjzxyiyiz' },
    }))
    // setModalState((prev) => ({
    //   ...prev,
    //   newVault,
    // }))
  }

  const updateSelectedCollaterals = (selectedCollaterals: SelectedCollateralsType) => {
    const addresses = Object.keys(selectedCollaterals)

    setModalState((prev) => ({
      ...prev,
      selectedCollaterals,
      selectedCollateralsAddresses: addresses,
      hasXTZTokenSelected: addresses.find((tokenAddress) => isTezosAsset(tokenAddress)),
    }))
  }

  const collateralsBalance = useMemo(
    () =>
      modalState.selectedCollateralsAddresses.reduce((acc, collateralAddress) => {
        const collateralToken = getTokenDataByAddress({ tokenAddress: collateralAddress, tokensPrices, tokensMetadata })

        if (!collateralToken || !collateralToken.rate) return acc

        const { amount } = modalState.selectedCollaterals[collateralAddress]
        const { rate } = collateralToken

        return (acc += Number(amount) * Number(rate))
      }, 0) / 2,
    [],
  )
  const borrowCapacity = useMemo(
    () => Math.min(Math.max(collateralsBalance, data?.avaliableLiquidity ?? 0, 0)),
    [collateralsBalance, data?.avaliableLiquidity],
  )

  const ctx = useMemo(
    () => ({
      ...modalState,
      resetCreateVaultModalState,
      updateScreenToShow,
      updateInputVaultState,
      updateVaultCreating,
      updateNewVault,
      updateSelectedCollaterals,
      closePopup,
      data,
      show,
      collateralsBalance,
      borrowCapacity,
    }),
    [borrowCapacity, closePopup, collateralsBalance, data, modalState, show],
  )

  return <createVaultModalContext.Provider value={ctx}>{children}</createVaultModalContext.Provider>
}
