import React, { useCallback, useMemo } from 'react'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useCreateVaultContext } from '../context/createVaultModalContext'

// utils
import {
  checkWhetherTokenIsCollateralToken,
  checkWhetherTokenIsLoanToken,
  getTokenDataByAddress,
} from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForContractCall } from 'utils/calcFunctions'

// types
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

// actions
import { createVault } from 'providers/VaultsProvider/actions/vaults.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import { CREATE_VAULT_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { ADD_COLLATERAL_SCREEN_ID, BORROW_SCREEN_ID } from '../helpers/createNewVault.consts'
import { AVALIABLE_TO_BORROW } from 'texts/tooltips/vault.text'

// styles
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { ConfirmStatsVaultOverview } from '../createNewVault.style'
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'

// components
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from 'app/App.components/Table'
import Button from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

export const ConfirmStats = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { vaultFactoryAddress, lendingControllerAddress },
  } = useDappConfigContext()
  const {
    selectedCollateralsAddresses,
    selectedCollaterals,
    updateScreenToShow,
    isVaultCreating,
    updateVaultCreating,
    vaultInputState,
    data,
    borrowCapacity,
    collateralsBalance,
    selectedBaker,
  } = useCreateVaultContext()

  const { marketTokenAddress = '' } = data ?? {}

  //   create vault action -----------------------------------------------------------------------
  const createVaultAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    const loanToken = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata })

    if (loanToken && checkWhetherTokenIsLoanToken(loanToken) && vaultFactoryAddress && lendingControllerAddress) {
      updateVaultCreating(true)

      const tokensArr = selectedCollateralsAddresses.reduce<
        Array<
          LoansCollateralTokenMetadataType & {
            amount: number
          }
        >
      >((acc, address) => {
        const { amount } = selectedCollaterals[address]
        const collateralToken = getTokenDataByAddress({
          tokenAddress: address,
          tokensMetadata,
          tokensPrices,
        })

        if (!collateralToken || !checkWhetherTokenIsCollateralToken(collateralToken)) return acc

        acc.push({
          ...collateralToken,
          amount: convertNumberForContractCall({
            number: Number(amount),
            grade: collateralToken?.decimals,
          }),
        })
        return acc
      }, [])

      return await createVault(
        userAddress,
        loanToken.loanData.indexerName,
        vaultInputState.name,
        vaultFactoryAddress,
        lendingControllerAddress,
        tokensArr,
        selectedBaker?.bakerAddress ?? null,
      )
    }

    return null
  }, [
    userAddress,
    marketTokenAddress,
    tokensMetadata,
    vaultFactoryAddress,
    lendingControllerAddress,
    bug,
    updateVaultCreating,
    selectedCollateralsAddresses,
    vaultInputState.name,
    selectedBaker?.bakerAddress,
    selectedCollaterals,
    tokensPrices,
  ])

  const createVaultActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: CREATE_VAULT_ACTION,
      actionFn: createVaultAction,
      successActionCallback: () => updateScreenToShow(BORROW_SCREEN_ID),
      dappActionCallback: () => updateVaultCreating(false),
      errActionCallback: () => updateVaultCreating(false),
      isSilentAction: true,
    }),
    [createVaultAction, updateScreenToShow, updateVaultCreating],
  )

  const { action: createVaultHandler } = useContractAction(createVaultActionProps)

  const backHandler = useCallback(() => updateScreenToShow(ADD_COLLATERAL_SCREEN_ID), [updateScreenToShow])

  return (
    <div>
      <div>
        <ConfirmStatsVaultOverview>
          <div className="">
            <ThreeLevelListItem>
              <div className="name">Vault name</div>
              <div className="value">{vaultInputState.name}</div>
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
                  <TableRow key={symbol} $rowHeight={25} $borderColor="primaryText" className="add-hover">
                    <TableCell $width="33%">{symbol}</TableCell>
                    <TableCell $width="33%">
                      <CommaNumber value={balance} decimalsToShow={Number(decimals)} useAccurateParsing={balance < 1} />
                    </TableCell>
                    <TableCell $width="33%" $contentPosition="right">
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
        </ConfirmStatsVaultOverview>

        <div className="confirmation-stats">
          <ThreeLevelListItem>
            <div className="name">Selected Baker</div>
            <div className="value">{selectedBaker?.bakerName ?? 'Not relevant'}</div>
          </ThreeLevelListItem>
          <ThreeLevelListItem className="align-tree-item-right">
            <div className="name">Total Collateral Deposited</div>
            <CommaNumber value={collateralsBalance} decimalsToShow={2} className="value" beginningText="$" />
          </ThreeLevelListItem>
          <ThreeLevelListItem className="right">
            <div className="name">
              Available To Borrow
              <Tooltip>
                <Tooltip.Trigger className="ml-3">
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>{AVALIABLE_TO_BORROW}</Tooltip.Content>
              </Tooltip>
            </div>
            <CommaNumber value={borrowCapacity} className="value" beginningText="$" />
          </ThreeLevelListItem>
        </div>
      </div>
      <div className="buttons-wrapper" style={{ marginTop: '30px' }}>
        <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={backHandler}>
          <Icon id="arrowLeft" />
          Back
        </Button>
        <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={isVaultCreating} onClick={createVaultHandler}>
          <Icon id="sign" />
          Create Vault
        </Button>
      </div>
      {isVaultCreating ? (
        <div className="creating-vault-loader-wrapper">
          Creating Vault
          <SpinnerCircleLoaderStyled />
        </div>
      ) : null}
    </div>
  )
}
