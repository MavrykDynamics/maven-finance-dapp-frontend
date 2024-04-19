import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// const
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { BORROW_TAB_ID, LEND_TAB_ID } from './Loans.const'
import {
  DEFAULT_LOANS_ACTIVE_SUBS,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
} from 'providers/LoansProvider/helpers/loans.const'
import { FatalError } from 'errors/error'

// view
import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { BorrowingTab } from './Components/BorrowingTab'
import { LendingTab } from './Components/LendingTab'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'

// styles
import { Page } from 'styles'
import { EmptyContainer } from 'app/App.style'
import { MarketPagination, MarketStyled, ThreeLevelListItem } from './Loans.style'

// types
import { MarketPageHeader } from './Components/LoansPageHeader'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { USER_AVAILABLE_BORROW } from 'texts/tooltips/loan.text'
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'
import { getVaultBorrowCapacity, getVaultCollateralBalance } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import {
  DEFAULT_VAULTS_ACTIVE_SUBS,
  VAULTS_DATA,
  VAULTS_USER_ALL,
} from 'providers/VaultsProvider/vaults.provider.consts'
import { CHECK_WHETHER_MARKET_EXISTS } from 'providers/LoansProvider/queries/loansMarkets.query'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'

export const Market = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const historyState = state as { from?: string }

  const { assetAddress: currentMarketAddress, tabId } = useParams<{
    assetAddress: string
    tabId: string
  }>()

  const { apolloClient } = useApolloContext()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { fatal } = useToasterContext()
  const { myVaultsIds, vaultsMapper, isLoading: isVaultsLoading, changeVaultsSubscriptionsList } = useVaultsContext()
  const {
    allMarketsAddresses,
    marketsMapper,
    config: { collateralFactor },
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
    isLoading: isLoansLoading,
  } = useLoansContext()

  const [isMarketExistanseLoading, setIsMarketExistanseLoading] = useState(false)

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
      [LOANS_CONFIG]: true,
    })
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_USER_ALL,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
      setMarketAddressToSubscribe(null)
    }
  }, [])

  // check whether market exists, cuz address is stored in url and user can change it
  useLayoutEffect(() => {
    if (currentMarketAddress && marketsMapper[currentMarketAddress]) {
      setMarketAddressToSubscribe(currentMarketAddress)
      return
    }

    setIsMarketExistanseLoading(true)

    const checkWhetherMarketExists = async () => {
      try {
        const marketFromGql = await apolloClient.query({
          query: CHECK_WHETHER_MARKET_EXISTS,
          variables: {
            marketAddress: currentMarketAddress ?? '',
          },
        })

        if (marketFromGql.data.lending_controller[0]?.loan_tokens?.[0]?.token?.token_address === currentMarketAddress) {
          setMarketAddressToSubscribe(currentMarketAddress)
          return
        }

        fatal(new FatalError(`Market with address "${currentMarketAddress}" does not exist`))
      } catch (e) {
        fatal(new FatalError('Loading market error, please, try to reload page'))
      } finally {
        setIsMarketExistanseLoading(false)
      }
    }

    checkWhetherMarketExists()

    return () => setMarketAddressToSubscribe(null)
  }, [currentMarketAddress])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [prevMarketAddress, nextMarketAddress] = useMemo(() => {
    const currentTokenIdx = allMarketsAddresses.findIndex(
      (marketTokenAddress) => marketTokenAddress === currentMarketAddress,
    )
    return [
      allMarketsAddresses.at(currentTokenIdx - 1) ?? allMarketsAddresses.at(-1),
      allMarketsAddresses.at(currentTokenIdx + 1) ?? allMarketsAddresses.at(0),
    ]
  }, [currentMarketAddress, allMarketsAddresses])

  const loanToken = getTokenDataByAddress({ tokenAddress: currentMarketAddress, tokensMetadata, tokensPrices })

  const { userTotalBorrowed, userTotalCollateral, userAccruedInterest, userAvailableBorrow } = useMemo(
    () =>
      myVaultsIds.reduce(
        (acc, itemId) => {
          const vault = vaultsMapper[itemId]

          if (!loanToken?.rate || vault.borrowedTokenAddress !== currentMarketAddress) return acc
          const { decimals: loanTokenDecimals, rate: loanTokenRate } = loanToken

          const vaultCollateralBalance = getVaultCollateralBalance(vault.collateralData, tokensMetadata, tokensPrices)
          const convertedBorrowedAmount =
            convertNumberForClient({ number: vault.borrowedAmount, grade: loanTokenDecimals }) * loanTokenRate
          const convertedInterestAmount =
            convertNumberForClient({ number: vault.fee, grade: loanTokenDecimals }) * loanTokenRate
          const convertedMarketAvailableLiquidity =
            convertNumberForClient({
              number: vault.availableLiquidity,
              grade: loanTokenDecimals,
            }) * loanTokenRate

          acc.userTotalBorrowed += convertedBorrowedAmount
          acc.userTotalCollateral += vaultCollateralBalance
          acc.userAccruedInterest += convertedInterestAmount
          acc.userAvailableBorrow += getVaultBorrowCapacity(
            convertedMarketAvailableLiquidity,
            convertedBorrowedAmount + convertedInterestAmount,
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
    [myVaultsIds, currentMarketAddress, loanToken, tokensMetadata, tokensPrices, vaultsMapper],
  )

  const selectedMarket = currentMarketAddress ? marketsMapper[currentMarketAddress] : null

  const marketAvailableLiquidity =
    selectedMarket && loanToken
      ? Math.max(
          convertNumberForClient({
            number: selectedMarket.availableLiquidity,
            grade: loanToken.decimals,
          }),
          0,
        )
      : 0

  const marketReserveAmount =
    selectedMarket && loanToken
      ? Math.max(
          convertNumberForClient({ number: selectedMarket.totalLended, grade: loanToken.decimals }) -
            convertNumberForClient({
              number: selectedMarket.reserveAmount,
              grade: loanToken.decimals,
            }),
          0,
        )
      : 0

  const marketPagination = (
    <MarketPagination>
      <Button
        onClick={() => navigate(historyState?.from ?? '/loans')}
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
            }}
            state={{ from: historyState?.from }}
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
            }}
            state={{ from: historyState?.from }}
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
      <MarketPageHeader assetAddress={currentMarketAddress} />

      {marketPagination}

      {isLoansLoading || isVaultsLoading || isMarketExistanseLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {loanToken?.symbol ?? currentMarketAddress} market</div>
        </DataLoaderWrapper>
      ) : selectedMarket && loanToken && loanToken.rate ? (
        <MarketStyled>
          <div className="gen-info">
            <div className="asset-info">
              <ImageWithPlug imageLink={loanToken.icon} alt={`${loanToken.icon} icon`} />

              <div className="text-wrapper">
                <div className="symbol">{loanToken.name}</div>
                <div className="full-name">{loanToken.symbol}</div>
              </div>
            </div>
            {tabId === LEND_TAB_ID ? (
              <>
                <ThreeLevelListItem>
                  <div className="name">Price</div>
                  <CommaNumber
                    value={loanToken.rate}
                    beginningText="$"
                    className="value"
                    showDecimal
                    decimalsToShow={4}
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Earn APY</div>
                  <CommaNumber value={selectedMarket.lendingAPY} endingText="%" className="value" />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Total Earning</div>
                  <CommaNumber
                    value={
                      convertNumberForClient({
                        number: selectedMarket.totalLended,
                        grade: loanToken.decimals,
                      }) * loanToken.rate
                    }
                    beginningText="$"
                    className="value"
                  />
                </ThreeLevelListItem>
                <ThreeLevelListItem>
                  <div className="name">Available Liquidity</div>
                  <CommaNumber value={marketAvailableLiquidity * loanToken.rate} beginningText="$" className="value" />
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
                  <CommaNumber
                    value={loanToken.rate}
                    beginningText="$"
                    className="value"
                    showDecimal
                    decimalsToShow={4}
                  />
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
                    <Tooltip>
                      <Tooltip.Trigger className="ml-5">
                        <Icon id="info" />
                      </Tooltip.Trigger>
                      <Tooltip.Content>{USER_AVAILABLE_BORROW(currentMarketAddress)}</Tooltip.Content>
                    </Tooltip>
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
              marketReserveAmount={marketReserveAmount}
            />
          ) : null}
          {tabId === BORROW_TAB_ID ? (
            <BorrowingTab
              loanTokenAddress={selectedMarket.loanTokenAddress}
              marketAvaliableLiquidity={selectedMarket.availableLiquidity}
            />
          ) : null}
        </MarketStyled>
      ) : (
        <EmptyContainer>
          <img src="/images/not-found.svg" alt="No market to show" />
          <figcaption>Market with address "{currentMarketAddress}" does not exist</figcaption>
        </EmptyContainer>
      )}
    </Page>
  )
}
