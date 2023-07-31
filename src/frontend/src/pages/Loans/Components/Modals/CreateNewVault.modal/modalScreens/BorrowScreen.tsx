import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo } from 'react'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { INPUT_STATUS_ERROR } from 'app/App.components/Input/Input.constants'
import { checkNan } from 'utils/checkNan'
import { getVaultCollateralRatio } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import colors from 'styles/colors'
import { BorrowScreenWrapper } from '../createNewVault.style'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { useFullVault } from 'providers/VaultsProvider/hooks/useFullVault'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import NewButton from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { CONFIRMATION_SCREEN_ID, testVaults } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useBorrowInputData } from '../components/useBorrowInputData'
import { DAO_FEE } from 'texts/tooltips/vault.text'
import { NewVaultType } from '../helpers/createNewVault.types'
import { BORROW_VAULT_ASSET_ACTION } from 'providers/VaultsProvider/helpers/vaults.const'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { borrowVaultAssetAction } from 'providers/VaultsProvider/actions/vaults.actions'
import { checkWhetherTokenIsLoanToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

type BorrowScreenProps = {
  setCurrentSymbol: React.Dispatch<React.SetStateAction<string>>
}

export const BorrowScreen = ({ setCurrentSymbol }: BorrowScreenProps) => {
  const {
    preferences: { themeSelected },
    globalLoadingState: { isActionActive },
    contractAddresses: { lendingControllerAddress },
  } = useDappConfigContext()

  const { newVault, updateScreenToShow, borrowCapacity, setFinalBorrowInputAmount } = useCreateVaultContext()
  const { vaultsMapper } = useVaultsContext()
  const {
    config: { daoFee },
  } = useLoansContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()

  const currentVault = vaultsMapper[(newVault as NewVaultType).address]
  const vaultData = useFullVault(currentVault)

  const {
    borrowedTokenAddress = '',
    borrowCapacity: originalBorrowCapacity = 0,
    borrowedAmount: currentBorrowedAmount = 0,
    collateralBalance: currentCollateralBalance = 0,
    collateralRatio = 0,
    apr = 0,
  } = vaultData ?? {}

  const { inputData, settings, inputProps, rate, icon, symbol, clearData, decimals } = useBorrowInputData(
    borrowedTokenAddress,
    originalBorrowCapacity,
  )

  const inputAmount = checkNan(parseFloat(inputData.amount))
  const convertedBorrowedAmount = convertNumberForClient({ number: currentBorrowedAmount, grade: decimals })
  const isDisabledButton = inputData.validationStatus === INPUT_STATUS_ERROR || inputAmount === 0 || isActionActive

  const borrowedToken = getTokenDataByAddress({ tokenAddress: borrowedTokenAddress, tokensMetadata, tokensPrices })

  useEffect(() => {
    setCurrentSymbol(symbol)
  }, [setCurrentSymbol, symbol])

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
    setFinalBorrowInputAmount({ amount: inputAmount, symbol, rate })

    clearData()
    updateScreenToShow(CONFIRMATION_SCREEN_ID)
  }, [clearData, inputAmount, rate, setFinalBorrowInputAmount, symbol, updateScreenToShow])

  const contractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: BORROW_VAULT_ASSET_ACTION,
      actionFn: borrowAction,
      dappCallback,
    }),
    [borrowAction, dappCallback],
  )

  const { action: borrowAsserHandler } = useContractAction(contractActionProps)

  const { futureCollateralRatio, futureBorrowCapacity } = useMemo(() => {
    const futureCollateralRatio = getVaultCollateralRatio(
      currentCollateralBalance,
      (currentBorrowedAmount + inputAmount) * rate,
    )

    const futureBorrowCapacity = borrowCapacity - inputAmount * rate

    return { futureCollateralRatio, futureBorrowCapacity }
  }, [currentCollateralBalance, currentBorrowedAmount, inputAmount, rate, borrowCapacity])

  // TODO sxtract to custom hook (same code <BorrowingExpandCardBorrowSection />)
  return (
    <BorrowScreenWrapper>
      <div className="borrow-screen-top-stats">
        <ThreeLevelListItem>
          <div className="name">Borrow Capacity</div>
          <CommaNumber value={borrowCapacity} decimalsToShow={0} className="value" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Collateral Utilization</div>
          {convertedBorrowedAmount > 0 ? (
            <CommaNumber value={collateralRatio} className="value" endingText="%" />
          ) : (
            <div className="value">Not Relevant</div>
          )}
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">Borrow APR</div>
          <CommaNumber value={apr} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">
            DAO Fee
            <CustomTooltip
              iconId="info"
              defaultStrokeColor={colors[themeSelected].textColor}
              text={DAO_FEE}
              className="tooltip"
            />
          </div>
          <CommaNumber value={daoFee} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
      </div>

      <div className="borrow-screen-input-wrapper">
        <div className="block-name">Select the amount to borrow</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': rate })}
          inputProps={inputProps}
          settings={settings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>
      <BorrowScreenBottomStats
        inputAmount={inputAmount}
        assetDecimalsToShow={assetDecimalsToShow}
        daoFee={daoFee}
        futureCollateralRatio={futureCollateralRatio}
        futureBorrowCapacity={futureBorrowCapacity}
        headerText="New Vault stats"
      />

      <div className="manage-btn">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={borrowAsserHandler} disabled={isDisabledButton}>
          Borrow
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </BorrowScreenWrapper>
  )
}
