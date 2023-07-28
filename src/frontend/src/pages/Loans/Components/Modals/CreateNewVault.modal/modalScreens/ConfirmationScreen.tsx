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
import React, { useCallback, useEffect, useMemo } from 'react'
import { ADD_COLLATERAL_SCREEN_ID } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { useCreateVaultContext } from '../helpers/createVaultModalContext'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { LoansCollateralTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { convertNumberForClient, convertNumberForContractCall } from 'utils/calcFunctions'
import { depositCollateralsAction } from 'providers/VaultsProvider/actions/vaultCollateral.actions'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { DEPOSIT_COLLATERAL_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { getVaultCollateralRatio, reduceVaultsAssets } from 'providers/VaultsProvider/helpers/vaults.utils'
import { VaultOverview } from 'pages/Loans/Components/LoansComponents.style'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { ConfirmationScreenWrapper } from '../createNewVault.style'
import colors from 'styles/colors'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { checkNan } from 'utils/checkNan'
import { useBorrowInputData } from '../components/useBorrowInputData'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'

export const ConfirmationScreen = () => {
  const {
    contractAddresses: { lendingControllerAddress },
    preferences: { themeSelected },
  } = useDappConfigContext()
  const { allVaultsIds, vaultsMapper } = useVaultsContext()
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

  const currentVault = vaultsMapper['KT1UCFPPgutMkkt3xBpSyAxH6piRjzxyiyiz']
  const vaultData = useFullVault(currentVault)

  const {
    collateralBalance: currentCollateralBalance = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    name,
  } = vaultData ?? {}

  const { inputData, rate, symbol } = useBorrowInputData(vaultData)
  const inputAmount = checkNan(parseFloat(inputData.amount))

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  // TODO add sub
  const { assetsBalances } = useMemo(() => {
    const { assetsBalances, globalVaultTVL, ...restVaultsStats } = reduceVaultsAssets(
      allVaultsIds,
      vaultsMapper,
      tokensMetadata,
      tokensPrices,
    )

    return { assetsBalances, globalVaultTVL, ...restVaultsStats }
  }, [allVaultsIds, tokensMetadata, tokensPrices, vaultsMapper])

  console.log(allVaultsIds, vaultsMapper, tokensMetadata, tokensPrices)

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
              <CommaNumber value={132916489} decimalsToShow={2} className="value" beginningText="$" />
            </ThreeLevelListItem>
          </div>
          <TableScrollable bodyHeight={108} className="stats-table-wrapper scroll-block">
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
