import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect, useParams } from 'react-router'
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

export const Market = () => {
  const dispatch = useDispatch()
  const { assetAddress, tabId } = useParams<{ assetAddress: string; tabId: string }>()

  const { tokensMetadata, tokensPrices } = useTokensContext()

  const { symbol, name, icon, decimals } = tokensMetadata[assetAddress]
  const rate = tokensPrices[symbol]

  const {
    loanTokens,
    isDataLoaded,
    vaults: { allVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const { userTotalBorrowed, userTotalCollateral, userAccruedInterest, userAvailableBorrow } = useMemo(
    () =>
      allVaultsIds.reduce(
        (acc, itemId) => {
          const vault = vaultsMapper[itemId]

          if (vault.ownerId !== accountPkh || vault.borrowedTokenAddress !== assetAddress) return acc

          const vaultTotlaCollateral = vault.collateralData.reduce(
            (acc, { amount, tokenAddress: collateralTokenAddress }) => {
              const { symbol } = tokensMetadata[collateralTokenAddress]
              const rate = tokensPrices[symbol]
              return (acc += amount * rate)
            },
            0,
          )

          acc.userTotalBorrowed += vault.borrowedAmount * rate
          acc.userTotalCollateral += vaultTotlaCollateral
          acc.userAccruedInterest += vault.fee * rate
          acc.userAvailableBorrow += vaultTotlaCollateral || vault.availableLiquidity * rate
          return acc
        },
        {
          userTotalBorrowed: 0,
          userTotalCollateral: 0,
          userAccruedInterest: 0,
          userAvailableBorrow: 0,
        },
      ),
    [accountPkh, allVaultsIds, assetAddress, rate, tokensMetadata, tokensPrices, vaultsMapper],
  )

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        if (!isDataLoaded || isDepsChanged) {
          await dispatch(getLoansStorage())
        }
      } catch (e) {}
    },
    [accountPkh],
  )

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

  if (isLoading) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {assetAddress} market</div>
        </DataLoaderWrapper>
      </Page>
    )
  }

  if (!currentToken) {
    return <Redirect to={'/loans'} />
  }

  const marketPagination = (
    <MarketPagination>
      <Link to="/loans">
        <Button text="Go Back" icon="arrowRight" className="arrow" kind={TRANSPARENT_WITH_BORDER} />
      </Link>

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
                <CommaNumber value={currentToken.totalLended} beginningText="$" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Available Liquidity</div>
                <CommaNumber value={Math.max(currentToken.availableLiquidity, 0)} beginningText="$" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Collateral Factor</div>
                <CommaNumber value={currentToken.collateralFactor} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Suppliers</div>
                {/* TODO: add mTokens usage from tokens context */}
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
            marketAvailableLiquidity={currentToken.availableLiquidity}
            marketReserveAmount={currentToken.reserveAmount}
          />
        ) : null}
        {tabId === BORROW_TAB_ID ? <BorrowingTab loanTokenAddress={currentToken.loanTokenAddress} /> : null}
      </MarketStyled>
    </Page>
  )
}
