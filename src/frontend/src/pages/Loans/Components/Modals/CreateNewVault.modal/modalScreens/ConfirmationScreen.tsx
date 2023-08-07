import React, { useCallback, useMemo } from 'react'

// consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { BORROW_SCREEN_ID } from '../helpers/createNewVault.consts'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { BORROW_VAULT_ASSET_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

// components
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { ConfirmationScreenWrapper } from '../createNewVault.style'

// utils
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'

// providers
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// types
import { NewVaultType } from '../helpers/createNewVault.types'

// actions

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { borrowVaultAssetAction } from 'providers/VaultsProvider/actions/vaults.actions'

export const ConfirmationScreen = () => {
  const {
    contractAddresses: { lendingControllerAddress },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()
  const { vaultsMapper } = useVaultsContext()
  const { choosenBaker } = useXtzBakersForDD()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateScreenToShow,
    newVault,
    borrowCapacity,
    closePopup,
    finalBorrowInputData,
    collateralsBalance,
  } = useCreateVaultContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const currentVault = vaultsMapper[(newVault as NewVaultType).address]
  const vaultData = useFullVault(currentVault)

  const {
    borrowedTokenAddress = '',
    collateralBalance: currentCollateralBalance = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    name,
  } = vaultData ?? {}

  const { amount: inputAmount, rate, symbol } = finalBorrowInputData

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

  // borrow vault asset action ----------------------------------------------
  const borrowAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!lendingControllerAddress) {
      bug('Wrong lending address')
      return null
    }

    // call action only when there is vault if and correct loan token
    if (borrowedToken && vaultData?.vaultId && checkWhetherTokenIsLoanToken(borrowedToken)) {
      return await borrowVaultAssetAction(lendingControllerAddress, vaultData.vaultId, inputAmount, borrowedToken)
    }
    return null
  }, [borrowedToken, bug, inputAmount, lendingControllerAddress, userAddress, vaultData?.vaultId])

  const dappCallback = useCallback(() => {
    debugger
    closePopup()
  }, [closePopup])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: BORROW_VAULT_ASSET_ACTION,
      actionFn: borrowAction,
      dappCallback,
    }),
    [borrowAction, dappCallback],
  )

  const { action: borrowAsserHandler } = useContractAction(contractActionProps)

  const backHandler = useCallback(() => updateScreenToShow(BORROW_SCREEN_ID), [updateScreenToShow])

  const isBorrowBtnDisabled =
    isActionActive ||
    Boolean(
      !selectedCollateralsAddresses.every((tokenAddress) => {
        return selectedCollaterals[tokenAddress].validation === INPUT_STATUS_SUCCESS
      }),
    )

  return (
    <ConfirmationScreenWrapper>
      <div className="table-wrapper">
        <div className="block-name">New Vault stats</div>
        <VaultOverview>
          <div className="confirmation-stats">
            <ThreeLevelListItem>
              <div className="name">Vault name</div>
              <div className="value">{name}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Selected Baker</div>
              <div className="value">{choosenBaker?.bakerName ?? 'Not relevant'}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Total Collateral Deposited</div>
              <CommaNumber value={collateralsBalance} decimalsToShow={2} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>
          <Table>
            <TableHeader className="treasury">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className="treasury">
              {selectedCollateralsAddresses.map((address) => {
                const { tokenAddress, amount } = selectedCollaterals[address]
                const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                if (!token || !token.rate) return null

                const { symbol, rate, decimals } = token

                const balance = Number(amount)

                return (
                  <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                    <TableCell width="33%">{symbol}</TableCell>
                    <TableCell width="33%">
                      <CommaNumber value={balance} decimalsToShow={Number(decimals)} useAccurateParsing={balance < 1} />
                    </TableCell>
                    <TableCell width="33%" contentPosition="right">
                      <CommaNumber
                        value={balance * rate}
                        beginningText={rate ? '$' : symbol}
                        useAccurateParsing={balance < 1}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </VaultOverview>
      </div>

      <div className="bottom-stats-wrapper">
        <BorrowScreenBottomStats
          inputAmount={inputAmount}
          assetDecimalsToShow={assetDecimalsToShow}
          daoFee={daoFee}
          futureCollateralRatio={futureCollateralRatio}
          futureBorrowCapacity={futureBorrowCapacity}
          headerText={`New Borrow ${symbol} stats`}
        />
      </div>

      <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
        <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backHandler} disabled={isActionActive}>
          <Icon id="arrowLeft" />
          Back
        </NewButton>
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isBorrowBtnDisabled} onClick={borrowAsserHandler}>
          <Icon id="loans" />
          Borrow
        </NewButton>
      </div>
    </ConfirmationScreenWrapper>
  )
}
