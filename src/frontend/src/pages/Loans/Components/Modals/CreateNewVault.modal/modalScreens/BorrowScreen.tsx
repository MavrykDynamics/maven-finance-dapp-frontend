import { useCallback, useEffect, useMemo } from 'react'
import classNames from 'classnames'

// components
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { Input } from 'app/App.components/Input/NewInput'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { BorrowScreenBottomStats } from '../components/BorrowScreenBottomStats'

// styles
import { SpinnerCircleLoaderStyled } from 'app/App.components/Loader/Loader.style'
import { BorrowScreenWrapper } from '../createNewVault.style'
import { InputPinnedTokenInfo } from 'app/App.components/Input/Input.style'
import { ThreeLevelListItem } from 'pages/Loans/Loans.style'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useCreateVaultContext } from '../context/createVaultModalContext'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { fetchGraphQLData } from 'providers/QueryProvider/useGraphQLQuery'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// consts
import { ERR_MSG_INPUT, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { CONFIRMATION_SCREEN_ID } from '../helpers/createNewVault.consts'
import { assetDecimalsToShow } from 'pages/Loans/Loans.const'
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { DAO_FEE } from 'texts/tooltips/vault.text'

// utils
import { checkNan } from 'utils/checkNan'
import { convertNumberForClient } from 'utils/calcFunctions'
import { validateInputLength } from 'app/App.utils/input/validateInput'
import { sleep } from 'utils/api/sleep'

// queries
import { GET_NEW_VAULT } from 'providers/VaultsProvider/queries/newVault.query'

// hooks
import { useBorrowInputData } from '../../hooks/Market/useBorrowInputData'

// types
import { InputSettings } from 'app/App.components/Input/newInput.type'
import { operationBorrow, useVaultFutureStats } from 'providers/VaultsProvider/hooks/useVaultFutureStats'

type BorrowScreenProps = {
  setCurrentSymbol: React.Dispatch<React.SetStateAction<string>>
}

// new vault initial values
const currentBorrowedAmount = 0
const currentTotalOutstanding = 0
const collateralRatio = 0

export const BorrowScreen = ({ setCurrentSymbol }: BorrowScreenProps) => {
  const { handleQueryError } = useQueryProvider()
  const { userAddress } = useUserContext()
  const { info, bug } = useToasterContext()
  const {
    globalLoadingState: { isActionActive },
  } = useDappConfigContext()

  const {
    updateScreenToShow,
    borrowCapacity,
    isVaultCreating,
    setFinalBorrowInputAmount,
    data,
    collateralsBalance: currentCollateralBalance,
    borrowAPR,
    vaultInputState,
    updateNewVault,
    marketAvailableLiquidity,
  } = useCreateVaultContext()
  const {
    config: { daoFee },
  } = useLoansContext()

  const { marketTokenAddress: borrowedTokenAddress = '', setCreatedVaultAddress } = data ?? {}

  const { inputData, settings, inputProps, rate, icon, symbol, decimals } = useBorrowInputData(
    borrowedTokenAddress,
    borrowCapacity,
  )

  const inputAmount = checkNan(parseFloat(inputData.amount))
  const convertedBorrowedAmount = convertNumberForClient({ number: currentBorrowedAmount, grade: decimals })

  const { futureCollateralRatio, futureBorrowCapacity } = useVaultFutureStats({
    vaultCurrentTotalOutstanding: currentTotalOutstanding,
    vaultCurrentCollateralBalance: currentCollateralBalance,
    vaultTokenAddress: borrowedTokenAddress,
    operationType: operationBorrow,
    inputValue: inputAmount,
    marketAvailableLiquidity,
  })

  const isDisabledButton =
    inputData.validationStatus !== INPUT_STATUS_SUCCESS || inputAmount === 0 || isActionActive || isVaultCreating

  // Actions --------------------------------------------------------------------
  const getNewVaultData = useCallback(
    async (retries = 1) => {
      try {
        const newVaultData = await fetchGraphQLData<{ vault: Array<{ address: string; id: number }> }>(
          GET_NEW_VAULT,
          { userAddress: userAddress, vaultName: vaultInputState.name },
        )

        if (newVaultData.vault.length) {
          const { address, id } = newVaultData.vault[0]
          setCreatedVaultAddress?.(address)
          updateNewVault({
            address,
            id,
          })

          // TODO remove retry after indexer update

          // there is a case when it will return an empty array without data even when new vault
          // was created bacause of indexer problems. It will try to refetch the newly create vault
          // only once and if it fails - show bug, successes - move to the next modal screen
        } else if (retries !== 0) {
          info('Refetching new vault', 'Trying to refetch the new vault data. Plases wait 7 seconds...')
          await sleep(7000)
          await getNewVaultData(retries - 1)
        } else {
          bug(
            "Can't fetch new vault data, try reload the page and find your newly created vault in the the list of vaults",
            'Update Vault Error',
          )
        }
      } catch (e) {
        bug('Fetch Error', 'Error occured while loading latest created vault, please reload the page')
      }
    },
    [bug, info, setCreatedVaultAddress, updateNewVault, userAddress, vaultInputState.name],
  )

  useEffect(() => {
    setCurrentSymbol(symbol)
  }, [setCurrentSymbol, symbol])

  useEffect(() => {
    if (!isVaultCreating) {
      getNewVaultData()
    }
  }, [getNewVaultData, isVaultCreating])

  const continueHandler = useCallback(() => {
    setFinalBorrowInputAmount({ amount: Number(inputData.amount), rate, symbol })
    updateScreenToShow(CONFIRMATION_SCREEN_ID)
  }, [inputData.amount, rate, setFinalBorrowInputAmount, symbol, updateScreenToShow])

  const newSettings: InputSettings = useMemo(
    () => ({
      ...settings,
      validationFns: [[validateInputLength, ERR_MSG_INPUT]],
    }),
    [settings],
  )

  return (
    <BorrowScreenWrapper>
      <div className="borrow-screen-top-stats">
        <ThreeLevelListItem>
          <div className="name">Borrow Capacity</div>
          <CommaNumber beginningText={'$'} value={borrowCapacity} decimalsToShow={2} className="value" />
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
          <CommaNumber value={borrowAPR} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
        <ThreeLevelListItem>
          <div className="name">
            DAO Fee
            <Tooltip>
              <Tooltip.Trigger className="ml-3">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>{DAO_FEE}</Tooltip.Content>
            </Tooltip>
          </div>
          <CommaNumber value={daoFee} decimalsToShow={2} className="value" endingText="%" />
        </ThreeLevelListItem>
      </div>

      <div className="borrow-screen-input-wrapper">
        <div className="block-name">Select the amount to borrow</div>

        <Input
          className={classNames('pinned-dropdown', { 'input-with-rate': rate })}
          inputProps={inputProps}
          settings={newSettings}
        >
          <InputPinnedTokenInfo>
            <ImageWithPlug imageLink={icon} alt={`${symbol} icon`} useRounded /> {symbol}
          </InputPinnedTokenInfo>
        </Input>
      </div>
      <BorrowScreenBottomStats
        inputAmount={inputAmount}
        assetDecimalsToShow={2}
        daoFee={daoFee}
        futureCollateralRatio={futureCollateralRatio}
        futureBorrowCapacity={futureBorrowCapacity}
        headerText="New Vault stats"
      />

      <div className="manage-btn">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={continueHandler} disabled={isDisabledButton}>
          Continue
          <Icon id="arrowRight" />
        </NewButton>
      </div>
      {isVaultCreating ? (
        <div className="creating-vault-loader-wrapper">
          Creating Vault
          <SpinnerCircleLoaderStyled />
        </div>
      ) : null}
    </BorrowScreenWrapper>
  )
}
