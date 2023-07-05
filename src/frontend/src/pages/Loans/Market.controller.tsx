import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowingTab } from './Components/BorrowingTab'
import { LendingTab } from './Components/LendingTab'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'

// styles
import { Page } from 'styles'
import { MarketPagination, MarketStyled, ThreeLevelListItem } from './Loans.style'

// types
import { State } from 'reducers'
import { MarketPageHeader } from './Components/LoansPageHeader'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { getLoansStorage } from './Actions/getLoansData.actions'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'
import colors from 'styles/colors'
import { USER_AVAILABLE_BORROW } from 'texts/tooltips/loan.text'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getVaultBorrowCapacity, getVaultCollateralBalance } from 'providers/LoansProvider/helpers/vaults.utils'

export const Market = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const { assetAddress, tabId } = useParams<{ assetAddress: string; tabId: string }>()

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const {
    loanTokens,
    vaults: { myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getLoansStorage())
    } catch (e) {}
  }, [accountPkh])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [prevMarket, nextMarket, currentToken] = useMemo(() => {
    const currentTokenIdx = loanTokens.findIndex(({ loanTokenAddress }) => loanTokenAddress === assetAddress)
    return [
      loanTokens.at(currentTokenIdx - 1) ?? loanTokens.at(-1),
      loanTokens.at(currentTokenIdx + 1) ?? loanTokens.at(0),
      loanTokens.at(currentTokenIdx),
    ]
  }, [assetAddress, loanTokens])

  const loanToken = getTokenDataByAddress({ tokenAddress: assetAddress, tokensMetadata, tokensPrices })

  const { userTotalBorrowed, userTotalCollateral, userAccruedInterest, userAvailableBorrow } = useMemo(
    () =>
      myVaultsIds.reduce(
        (acc, itemId) => {
          const vault = vaultsMapper[itemId]

          if (vault.ownerId !== accountPkh || vault.borrowedTokenAddress !== assetAddress || !loanToken?.rate)
            return acc
          const { decimals: loanTokenDecimals, rate: loanTokenRate } = loanToken

          const vaultCollateralBalance = getVaultCollateralBalance(vault.collateralData, tokensMetadata, tokensPrices)
          const convertedBorrowedAmount =
            convertNumberForClient({ number: vault.borrowedAmount, grade: loanTokenDecimals }) * loanTokenRate

          acc.userTotalBorrowed += convertedBorrowedAmount
          acc.userTotalCollateral += vaultCollateralBalance
          acc.userAccruedInterest +=
            convertNumberForClient({ number: vault.fee, grade: loanTokenDecimals }) * loanTokenRate
          acc.userAvailableBorrow += getVaultBorrowCapacity(
            convertNumberForClient({ number: vault.availableLiquidity, grade: loanTokenDecimals }) * loanTokenRate,
            convertedBorrowedAmount,
            vaultCollateralBalance,
          )
          return acc
        },
        {
          userTotalBorrowed: 0,
          userTotalCollateral: 0,
          userAccruedInterest: 0,
          userAvailableBorrow: 0,
        },
      ),
    [accountPkh, myVaultsIds, assetAddress, loanToken, tokensMetadata, tokensPrices, vaultsMapper],
  )

  if (!loanToken || !loanToken.rate) return null

  const { symbol, name, icon, decimals, rate } = loanToken

  if (isLoading) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {symbol} market</div>
        </DataLoaderWrapper>
      </Page>
    )
  }

  if (!currentToken) {
    return <Redirect to={'/loans'} />
  }

  const marketPagination = (
    <MarketPagination>
      <Button
        onClick={() => history.goBack()}
        text="Go Back"
        icon="arrowRight"
        className="arrow"
        kind={TRANSPARENT_WITH_BORDER}
      />

      <div className="right-side-wrapper">
        {prevMarket ? (
          <Link to={`/loans/${prevMarket.loanTokenAddress}/${tabId}`}>
            <span className="left">
              <Icon id="paginationArrowLeft" /> Previous Market
            </span>
          </Link>
        ) : null}

        {nextMarket ? (
          <Link to={`/loans/${nextMarket.loanTokenAddress}/${tabId}`}>
            <span className="right">
              Next Market
              <Icon id="paginationArrowLeft" />
            </span>
          </Link>
        ) : null}
      </div>
    </MarketPagination>
  )

  return (
    <Page>
      <MarketPageHeader assetAddress={assetAddress} />

      {marketPagination}

      <MarketStyled>
        <div className="gen-info">
          <div className="asset-info">
            <ImageWithPlug imageLink={icon} alt={`${icon} icon`} />

            <div className="text-wrapper">
              <div className="symbol">{name}</div>
              <div className="full-name">{symbol}</div>
            </div>
          </div>
          {tabId === LEND_TAB_ID ? (
            <>
              <ThreeLevelListItem>
                <div className="name">Price</div>
                <CommaNumber value={rate} beginningText="$" className="value" showDecimal decimalsToShow={4} />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Earn APY</div>
                <CommaNumber value={currentToken.lendingAPY} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Total Lending</div>
                <CommaNumber
                  value={convertNumberForClient({ number: currentToken.totalLended, grade: decimals })}
                  beginningText="$"
                  className="value"
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Available Liquidity</div>
                <CommaNumber
                  value={
                    Math.max(convertNumberForClient({ number: currentToken.availableLiquidity, grade: decimals }), 0) *
                    rate
                  }
                  beginningText="$"
                  className="value"
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Collateral Factor</div>
                <CommaNumber value={currentToken.collateralFactor} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Suppliers</div>
                <CommaNumber value={currentToken.suppliers} className="value" />
              </ThreeLevelListItem>
            </>
          ) : (
            <>
              <ThreeLevelListItem>
                <div className="name">Price</div>
                <CommaNumber value={rate} beginningText="$" className="value" showDecimal decimalsToShow={4} />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Your Total Loan Balance</div>
                <CommaNumber value={userTotalBorrowed} beginningText="$" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Your Total Collateral</div>
                <CommaNumber value={userTotalCollateral} beginningText="$" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Your Total Accrued Interest</div>
                <CommaNumber value={userAccruedInterest} beginningText="$" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">
                  Your Total Available Borrow
                  <CustomTooltip
                    iconId="info"
                    text={USER_AVAILABLE_BORROW(assetAddress)}
                    defaultStrokeColor={colors[themeSelected].textColor}
                  />
                </div>
                <CommaNumber value={userAvailableBorrow} beginningText="$" className="value" />
              </ThreeLevelListItem>
            </>
          )}
        </div>

        {tabId === LEND_TAB_ID ? (
          <LendingTab
            loanMtokenAddress={currentToken.loanMTokenAddress}
            loanTokenAddress={currentToken.loanTokenAddress}
            lendAPY={currentToken.lendingAPY}
          />
        ) : null}
        {tabId === BORROW_TAB_ID ? (
          <BorrowingTab
            loanTokenAddress={currentToken.loanTokenAddress}
            marketAvaliableLiquidity={currentToken.availableLiquidity}
          />
        ) : null}
      </MarketStyled>
    </Page>
  )
}
