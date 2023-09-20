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
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { getVaultBorrowCapacity } from 'providers/VaultsProvider/helpers/vaults.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { DropDownXTZBakerType } from 'providers/DappConfigProvider/bakers/useDDXtzBakers'

type Props = CreateNewModalProps & {
  children: React.ReactNode
}

export const CreateVaultModalProvider = ({ closePopup, show, data, children }: Props) => {
  const { tokensPrices, tokensMetadata } = useTokensContext()
  const { marketsMapper } = useLoansContext()
  const [modalState, setModalState] = useState<CreateVaultModalState>(DEFAULT_CREATE_VAULT_STATE)
  const { marketTokenAddress = '' } = data ?? {}

  const { availableLiquidity = 0, borrowAPR } = marketsMapper[marketTokenAddress] ?? {}

  const marketToken = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })
  const convertedAvailableLiquidity = marketToken
    ? Math.max(convertNumberForClient({ number: availableLiquidity, grade: marketToken.decimals }), 0)
    : 0

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

  const updateSelectedBaker = useCallback((selectedBaker: DropDownXTZBakerType | null) => {
    setModalState((prev) => ({
      ...prev,
      selectedBaker,
    }))
  }, [])

  const setFinalBorrowInputAmount = useCallback(({ amount, rate, symbol }: FinalBorrowInputDataType) => {
    setModalState((prev) => ({
      ...prev,
      finalBorrowInputData: { amount, rate, symbol },
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
      }, 0),
    [modalState.selectedCollaterals, modalState.selectedCollateralsAddresses, tokensMetadata, tokensPrices],
  )

  const borrowCapacity = useMemo(
    () =>
      getVaultBorrowCapacity(
        marketToken?.rate ? convertedAvailableLiquidity * marketToken.rate : 0,
        0,
        collateralsBalance,
      ),
    [marketToken?.rate, convertedAvailableLiquidity, collateralsBalance],
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
      updateSelectedBaker,
      closePopup,
      setFinalBorrowInputAmount,
      data,
      show,
      collateralsBalance,
      borrowCapacity,
      borrowAPR,
      marketAvailableLiquidity: convertedAvailableLiquidity,
    }),
    [
      modalState,
      resetCreateVaultModalState,
      updateScreenToShow,
      updateInputVaultState,
      updateVaultCreating,
      updateNewVault,
      updateSelectedCollaterals,
      updateSelectedBaker,
      closePopup,
      setFinalBorrowInputAmount,
      data,
      show,
      collateralsBalance,
      borrowCapacity,
      borrowAPR,
      convertedAvailableLiquidity,
    ],
  )

  return <createVaultModalContext.Provider value={ctx}>{children}</createVaultModalContext.Provider>
}
