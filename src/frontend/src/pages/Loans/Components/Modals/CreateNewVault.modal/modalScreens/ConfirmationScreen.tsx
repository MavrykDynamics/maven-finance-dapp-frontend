import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableScrollable,
} from 'app/App.components/Table'
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
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'
import { depositCollateralsAction } from 'providers/VaultsProvider/actions/vaultCollateral.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { DEPOSIT_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { BlockName } from 'pages/Dashboard/Dashboard.style'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { reduceVaultsAssets } from 'providers/VaultsProvider/helpers/vaults.utils'

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
    updateScreenToShow,
    isVaultCreating,
    newVault,
  } = useCreateVaultContext()

  const { allVaultsIds, vaultsMapper } = useVaultsContext()

  const { assetsBalances } = useMemo(() => {
    const { assetsBalances, globalVaultTVL, ...restVaultsStats } = reduceVaultsAssets(
      allVaultsIds,
      vaultsMapper,
      tokensMetadata,
      tokensPrices,
    )

    return { assetsBalances, globalVaultTVL, ...restVaultsStats }
  }, [allVaultsIds, tokensMetadata, tokensPrices, vaultsMapper])

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
      <div>
        <BlockName>Vaults Assets</BlockName>

        <TableScrollable bodyHeight={90} className="treasury-table scroll-block">
          <Table>
            <TableHeader className="treasury">
              <TableRow>
                <TableHeaderCell>Asset</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell contentPosition="right">USD Value</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody className="treasury">
              {assetsBalances.map(({ balance, tokenAddress }) => {
                const token = getTokenDataByAddress({ tokenAddress, tokensMetadata, tokensPrices })
                if (!token || !token.rate) return null

                const { symbol, rate, decimals } = token

                const convertedBalance = convertNumberForClient({ number: balance, grade: decimals })

                return (
                  <TableRow key={symbol} rowHeight={25} borderColor="dataColor" className="add-hover">
                    <TableCell width="33%">{symbol}</TableCell>
                    <TableCell width="33%">
                      <CommaNumber
                        value={convertedBalance}
                        decimalsToShow={Number(decimals)}
                        useAccurateParsing={balance < 1}
                      />
                    </TableCell>
                    <TableCell width="33%" contentPosition="right">
                      <CommaNumber
                        value={convertedBalance * rate}
                        beginningText={rate ? '$' : symbol}
                        useAccurateParsing={balance < 1}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableScrollable>
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
