import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory, useParams } from 'react-router'
import { Link } from 'react-router-dom'

// const
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'
import {
  LOANS_MARKETS_DATA,
  DEFAULT_LOANS_ACTIVE_SUBS,
  LOANS_CONFIG,
} from 'providers/LoansProvider/helpers/loans.const'

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
import { EmptyContainer } from 'app/App.style'
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
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getVaultBorrowCapacity, getVaultCollateralBalance } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const Market = () => {
  const history = useHistory<{ from?: string }>()
  const {
    location: { state: historyState },
  } = history
  const dispatch = useDispatch()
  const { assetAddress, tabId } = useParams<{ assetAddress: string; tabId: string }>()

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    marketsAddresses,
    marketsMapper,
    config: { collateralFactor },
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
    isLoading: isLoansLoading,
  } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
      [LOANS_CONFIG]: true,
    })

    return () => changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
  }, [])

  useEffect(() => {
    setMarketAddressToSubscribe(assetAddress)
    return () => setMarketAddressToSubscribe(null)
  }, [assetAddress])

  const {
    vaults: { myVaultsIds, vaultsMapper },
  } = useSelector((state: State) => state.loans)

  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const { isLoading } = useDataLoader(async () => {
    try {
      await dispatch(getLoansStorage())
    } catch (e) {}
  }, [accountPkh])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [prevMarketAddress, nextMarketAddress, currentMarketAddress] = useMemo(() => {
    const currentTokenIdx = marketsAddresses.findIndex((marketTokenAddress) => marketTokenAddress === assetAddress)
    return [
      marketsAddresses.at(currentTokenIdx - 1) ?? marketsAddresses.at(-1),
      marketsAddresses.at(currentTokenIdx + 1) ?? marketsAddresses.at(0),
      marketsAddresses.at(currentTokenIdx),
    ]
  }, [assetAddress, marketsAddresses])

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

  if (isLoansLoading) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {loanToken?.symbol ?? currentMarketAddress} market</div>
        </DataLoaderWrapper>
      </Page>
    )
  }

  const selectedMarket = currentMarketAddress ? marketsMapper[currentMarketAddress] : null

  if (!selectedMarket || !loanToken || !loanToken.rate) {
    return (
      <Page>
        <PageHeader page={'lending'} />
        <EmptyContainer>
          <img src="/images/not-found.svg" alt="No market to show" />
          <figcaption>Market with address ({currentMarketAddress}) does not exist</figcaption>
        </EmptyContainer>
      </Page>
    )
  }

  const { symbol, name, icon, decimals, rate } = loanToken

  const marketPagination = (
    <MarketPagination>
      <Button
        onClick={() => history.push(historyState?.from ?? '/loans')}
        text="Go Back"
        icon="arrowRight"
        className="arrow"
        kind={TRANSPARENT_WITH_BORDER}
      />

      <div className="right-side-wrapper">
        {prevMarketAddress ? (
          <Link
            to={{
              pathname: `/loans/${prevMarketAddress}/${tabId}`,
              state: { from: historyState?.from },
            }}
          >
            <span className="left">
              <Icon id="paginationArrowLeft" /> Previous Market
            </span>
          </Link>
        ) : null}

        {nextMarketAddress ? (
          <Link
            to={{
              pathname: `/loans/${nextMarketAddress}/${tabId}`,
              state: { from: historyState?.from },
            }}
          >
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
                <CommaNumber value={selectedMarket.lendingAPY} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Total Earning</div>
                <CommaNumber
                  value={convertNumberForClient({ number: selectedMarket.totalLended, grade: decimals })}
                  beginningText="$"
                  className="value"
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Available Liquidity</div>
                <CommaNumber
                  value={
                    Math.max(
                      convertNumberForClient({ number: selectedMarket.availableLiquidity, grade: decimals }),
                      0,
                    ) * rate
                  }
                  beginningText="$"
                  className="value"
                />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Collateral Factor</div>
                <CommaNumber value={collateralFactor} endingText="%" className="value" />
              </ThreeLevelListItem>
              <ThreeLevelListItem>
                <div className="name">Suppliers</div>
                <CommaNumber value={selectedMarket.suppliers} className="value" />
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
            loanMtokenAddress={selectedMarket.loanMTokenAddress}
            loanTokenAddress={selectedMarket.loanTokenAddress}
            lendAPY={selectedMarket.lendingAPY}
          />
        ) : null}
        {tabId === BORROW_TAB_ID ? (
          <BorrowingTab
            loanTokenAddress={selectedMarket.loanTokenAddress}
            marketAvaliableLiquidity={selectedMarket.availableLiquidity}
          />
        ) : null}
      </MarketStyled>
    </Page>
  )
}
