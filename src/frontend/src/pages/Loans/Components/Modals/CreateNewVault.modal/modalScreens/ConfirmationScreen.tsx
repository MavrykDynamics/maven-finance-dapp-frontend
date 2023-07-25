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
import { useCreateVaultContext } from '../helpers/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { silverColor } from 'styles/colors'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForContractCall } from 'utils/calcFunctions'
import { depositCollateralsAction } from 'providers/VaultsProvider/actions/vaultCollateral.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { DEPOSIT_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'

type ConfirmationScreenProps = {
  avaliableLiquidity: number
  closePopup: () => void
}

export const ConfirmationScreen = ({ avaliableLiquidity, closePopup }: ConfirmationScreenProps) => {
  const {
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()
  const { choosenBaker } = useXtzBakersForDD()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const {
    hasXTZTokenSelected,
    selectedCollateralsAddresses,
    selectedCollaterals,
    vaultInputState,
    updateScreenToShow,
    isVaultCreating,
    newVault,
  } = useCreateVaultContext()

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

  const firstSelectedCollateralTokenData = getTokenDataByAddress({
    tokenAddress: selectedCollateralsAddresses[0],
    tokensPrices,
    tokensMetadata,
  })
  const collateralsBalance =
    selectedCollateralsAddresses.reduce((acc, collateralAddress) => {
      const collateralToken = getTokenDataByAddress({ tokenAddress: collateralAddress, tokensPrices, tokensMetadata })

      if (!collateralToken || !collateralToken.rate) return acc

      const { amount } = selectedCollaterals[collateralAddress]
      const { rate } = collateralToken

      return (acc += Number(amount) * Number(rate))
    }, 0) / 2
  const borrowCapacity = Math.min(Math.max(collateralsBalance, avaliableLiquidity, 0))

  const isAddCollateralContinueDisabled = Boolean(
    isVaultCreating ||
      (hasXTZTokenSelected && choosenBaker) ||
      !selectedCollateralsAddresses.every((tokenAddress) => {
        return selectedCollaterals[tokenAddress].validation === INPUT_STATUS_SUCCESS
      }),
  )

  return (
    <>
      {selectedCollateralsAddresses.length === 1 &&
      firstSelectedCollateralTokenData &&
      firstSelectedCollateralTokenData.rate ? (
        <div className="confirm-create-vault" style={{ marginBottom: '30px' }}>
          <ThreeLevelListItem>
            <div className="name">Asset</div>
            <div className="value">{firstSelectedCollateralTokenData.symbol}</div>
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">Amount</div>
            <CommaNumber
              value={Number(selectedCollaterals[firstSelectedCollateralTokenData.address].amount)}
              decimalsToShow={assetDecimalsToShow}
              className="value"
            />
          </ThreeLevelListItem>
          <ThreeLevelListItem>
            <div className="name">USD Value</div>
            <CommaNumber
              value={
                Number(selectedCollaterals[firstSelectedCollateralTokenData.address].amount) *
                firstSelectedCollateralTokenData.rate
              }
              className="value"
              beginningText="$"
            />
          </ThreeLevelListItem>
        </div>
      ) : (
        <Table className="treasury-table">
          <TableHeader className="treasury">
            <TableRow>
              <TableHeaderCell>Asset</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody className="treasury">
            {selectedCollateralsAddresses.map((collateralAddress, idx) => {
              const collateralToken = getTokenDataByAddress({
                tokenAddress: collateralAddress,
                tokensMetadata,
                tokensPrices,
              })

              if (!collateralToken || !collateralToken.rate) return null

              const { amount } = selectedCollaterals[collateralAddress]
              const { symbol, rate } = collateralToken

              return (
                <TableRow rowHeight={40} borderColor="dataColor" className="add-hover" key={symbol}>
                  <TableCell width="42%">{symbol}</TableCell>
                  <TableCell width="28%">
                    <CommaNumber value={Number(amount)} />
                  </TableCell>
                  <TableCell contentPosition="right" width="28%">
                    <CommaNumber value={Number(amount) * rate} className="value" beginningText="$" />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      <div className="confirm-create-vault">
        {hasXTZTokenSelected && choosenBaker ? (
          <ThreeLevelListItem>
            <div className="name">Selected Baker</div>
            <div className="value">{choosenBaker.bakerName}</div>
          </ThreeLevelListItem>
        ) : null}

        <ThreeLevelListItem>
          <div className="name">
            Borrowing Capacity{' '}
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={silverColor}
              text="How much you are able to borrow given your current collateral ratio including the amount you wish to borrow and the total amount available to borrow from the pool."
              className="tooltip"
            />
          </div>
          <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
        </ThreeLevelListItem>

        <ThreeLevelListItem>
          <div className="name">Vault Name</div>
          <div className="value">{vaultInputState.name}</div>
        </ThreeLevelListItem>
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
    </>
  )
}
