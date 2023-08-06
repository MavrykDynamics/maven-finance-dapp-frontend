import React, { useCallback, useMemo, useState } from 'react'
import { createVaultModalContext } from './createVaultModalContext'
import {
  CreateNewModalProps,
  CreateVaultModalState,
  FinalBorrowInputDataType,
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

  const resetCreateVaultModalState = useCallback(() => {
    setModalState(DEFAULT_CREATE_VAULT_STATE)
  }, [])

  const updateScreenToShow = useCallback((screenId: ScreenType) => {
    setModalState((prev) => ({
      ...prev,
      screenToShow: screenId,
    }))
  }, [])

  const updateInputVaultState = useCallback((vaultData: Partial<VaultInputState>) => {
    setModalState((prev) => ({
      ...prev,
      vaultInputState: { ...prev.vaultInputState, ...vaultData },
    }))
  }, [])

  const updateVaultCreating = useCallback((value: boolean) => {
    setModalState((prev) => ({
      ...prev,
      isVaultCreating: value,
    }))
  }, [])

  const updateNewVault = useCallback((newVault: NewVaultType) => {
    setModalState((prev) => ({
      ...prev,
      newVault,
    }))
  }, [])

  const updateSelectedCollaterals = useCallback((selectedCollaterals: SelectedCollateralsType) => {
    const addresses = Object.keys(selectedCollaterals)

    setModalState((prev) => ({
      ...prev,
      selectedCollaterals,
      selectedCollateralsAddresses: addresses,
      hasXTZTokenSelected: addresses.find((tokenAddress) => isTezosAsset(tokenAddress)),
    }))
  }, [])

  const setFinalBorrowInputAmount = useCallback(({ amount, rate, symbol }: FinalBorrowInputDataType) => {
    setModalState((prev) => ({
      ...prev,
      finalBorrowInputData: { amount: prev.finalBorrowInputData.amount + amount, rate, symbol },
    }))
  }, [])

  const collateralsBalance = useMemo(
    () =>
      modalState.selectedCollateralsAddresses.reduce((acc, collateralAddress) => {
        const collateralToken = getTokenDataByAddress({ tokenAddress: collateralAddress, tokensPrices, tokensMetadata })

        if (!collateralToken || !collateralToken.rate) return acc

        const { amount } = modalState.selectedCollaterals[collateralAddress]
        const { rate } = collateralToken

        return (acc += Number(amount) * Number(rate))
      }, 0) / 2,
    [modalState.selectedCollaterals, modalState.selectedCollateralsAddresses, tokensMetadata, tokensPrices],
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
      setFinalBorrowInputAmount,
      data,
      show,
      collateralsBalance,
      borrowCapacity,
    }),
    [borrowCapacity, closePopup, collateralsBalance, data, modalState, show],
  )

  return <createVaultModalContext.Provider value={ctx}>{children}</createVaultModalContext.Provider>
}
