import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import {
  checkWhetherTokenIsCollateralToken,
  getTokenDataByAddress,
} from 'providers/TokensProvider/helpers/tokens.utils'
import React, { useCallback, useMemo } from 'react'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { depositCollateralsAction } from 'providers/VaultsProvider/actions/vaultCollateral.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { DEPOSIT_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { ConfirmationScreenWrapper } from '../createNewVault.style'
import colors from 'styles/colors'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { checkNan } from 'utils/checkNan'
import { useBorrowInputData } from '../components/useBorrowInputData'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { NewVaultType } from '../helpers/createNewVault.types'

export const ConfirmationScreen = () => {
  const {
    contractAddresses: { lendingControllerAddress },
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { vaultsMapper } = useVaultsContext()
  const { choosenBaker } = useXtzBakersForDD()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    hasXTZTokenSelected,
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateScreenToShow,
    isVaultCreating,
    newVault,
    closePopup,
    borrowCapacity,
  } = useCreateVaultContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const currentVault = vaultsMapper[(newVault as NewVaultType).address]
  const vaultData = useFullVault(currentVault)

  console.log(vaultData)

  const {
    collateralBalance: currentCollateralBalance = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    name,
    borrowedTokenAddress = '',
    borrowCapacity: originalBorrowCapacity = 0,
  } = vaultData ?? {}

  const { inputData, rate, symbol } = useBorrowInputData(borrowedTokenAddress, originalBorrowCapacity)
  console.log(inputData)
  const inputAmount = checkNan(parseFloat(inputData.amount))

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  // deposit action ----------------------------------------------
  const depositAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (newVault && lendingControllerAddress) {
      const collaretalsToDeposit = selectedCollateralsAddresses.reduce<
        Array<
          LoansCollateralTokenMetadataType & {
            amount: number
          }
        >
      >((acc, tokenAddress) => {
        const collateralToken = getTokenDataByAddress({ tokenAddress, tokensMetadata })

        if (collateralToken && checkWhetherTokenIsCollateralToken(collateralToken)) {
          acc.push({
            ...collateralToken,
            amount: convertNumberForContractCall({
              number: Number(selectedCollaterals[tokenAddress].amount),
              grade: collateralToken.decimals,
            }),
          })
        }

        return acc
      }, [])

      return await depositCollateralsAction(
        userAddress,
        newVault.address,
        collaretalsToDeposit,
        newVault.id,
        lendingControllerAddress,
        closePopup,
        choosenBaker?.bakerAddress,
      )
    }

    return null
  }, [
    bug,
    choosenBaker?.bakerAddress,
    closePopup,
    lendingControllerAddress,
    newVault,
    selectedCollaterals,
    selectedCollateralsAddresses,
    tokensMetadata,
    userAddress,
  ])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: DEPOSIT_COLLATERAL_ACTION,
      actionFn: depositAction,
    }),
    [depositAction],
  )

  const { action: depositCollateralHandler } = useContractAction(contractActionProps)

  const totalCollateralDepositedValue = useMemo(
    () =>
      selectedCollateralsAddresses.reduce<number>((acc, address) => {
        const { tokenAddress, amount } = selectedCollaterals[address]
        const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
        if (!token || !token.rate) return acc

        const { rate } = token

        const convertedBalance = Number(amount) * rate

        return acc + convertedBalance
      }, 0),
    [selectedCollaterals, selectedCollateralsAddresses, tokensMetadata, tokensPrices],
  )

  const isAddCollateralContinueDisabled = Boolean(
    isVaultCreating ||
      (hasXTZTokenSelected && choosenBaker) ||
      !selectedCollateralsAddresses.every((tokenAddress) => {
        return selectedCollaterals[tokenAddress].validation === INPUT_STATUS_SUCCESS
      }),
  )

  return (
    <ConfirmationScreenWrapper>
      <div className="table-wrapper">
        <div className="block-name">New Vault stats</div>
        <VaultOverview>
          <div className="confirmation-top-stats">
            <ThreeLevelListItem>
              <div className="name">Vault name</div>
              <div className="value">{name}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">Selected Baker</div>
              <div className="value">{choosenBaker?.bakerName ?? 'Not relevant'}</div>
            </ThreeLevelListItem>
            <ThreeLevelListItem>
              <div className="name">
                Total Collateral Deposited
                <CustomTooltip
                  iconId="info"
                  defaultStrokeColor={colors[themeSelected].textColor}
                  text={'tooltip text'}
                  className="tooltip"
                />
              </div>
              <CommaNumber
                value={totalCollateralDepositedValue}
                decimalsToShow={2}
                className="value"
                beginningText="$"
              />
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
        <NewButton
          kind={BUTTON_SECONDARY}
          form={BUTTON_WIDE}
          onClick={() => updateScreenToShow(ADD_COLLATERAL_SCREEN_ID)}
        >
          <Icon id="arrowLeft" />
          Back
        </NewButton>
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          disabled={isAddCollateralContinueDisabled}
          onClick={depositCollateralHandler}
        >
          <Icon id="plus" />
          Deposit
        </NewButton>
      </div>
    </ConfirmationScreenWrapper>
  )
}
