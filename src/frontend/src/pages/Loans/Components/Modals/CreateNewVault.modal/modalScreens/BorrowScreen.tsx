import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import classNames from 'classnames'
import { useMemo } from 'react'
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
import { CONFIRMATION_SCREEN_ID } from '../helpers/createNewVault.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'
import { convertNumberForClient } from 'utils/calcFunctions'
import { useBorrowInputData } from '../components/useBorrowInputData'
import { DAO_FEE } from 'texts/tooltips/vault.text'

export const BorrowScreen = () => {
  const {
    preferences: { themeSelected },
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const { newVault, updateScreenToShow, borrowCapacity } = useCreateVaultContext()
  const { vaultsMapper } = useVaultsContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const currentVault = vaultsMapper[newVault?.id.toString() ?? 'KT1UCFPPgutMkkt3xBpSyAxH6piRjzxyiyiz']
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
        <NewButton
          kind={BUTTON_PRIMARY}
          form={BUTTON_WIDE}
          onClick={() => {
            clearData()
            updateScreenToShow(CONFIRMATION_SCREEN_ID)
          }}
          disabled={isDisabledButton}
        >
          Borrow
          <Icon id="arrowRight" />
        </NewButton>
      </div>
    </BorrowScreenWrapper>
  )
}
