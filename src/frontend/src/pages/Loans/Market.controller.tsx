import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'

// const
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import {
  BORROW_TAB_ID,
  GqlVaultWithBalancesAggregate,
  gqlVaultWithBalancesAggregateSchema,
  LEND_TAB_ID,
} from './Loans.const'
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
import { getVaultBorrowCapacity } from 'providers/VaultsProvider/helpers/vaults.utils'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useQueryProvider } from 'providers/QueryProvider/query.provider'
import { fetchGraphQLData } from 'providers/QueryProvider/useGraphQLQuery'
import { CHECK_WHETHER_MARKET_EXISTS } from 'providers/LoansProvider/queries/loansMarkets.query'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import { useGraphQLQuery } from 'providers/QueryProvider/useGraphQLQuery'
import { USER_VAULT_BALANCES_QUERY } from './queries/userVaultBalances.query'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { MVRK_DECIMALS } from 'utils/constants'

type UserVaultBalances = {
  availableLiquidity: number
  userAccruedInterest: number
  userTotalBorrowed: number
  userTotalCollateral: number
}

export const Market = () => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const historyState = state as { from?: string }

  const { assetAddress: currentMarketAddress = '', tabId = '' } = useParams<{
    assetAddress: string
    tabId: string
  }>()

  const { handleQueryError } = useQueryProvider()
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { userAddress } = useUserContext()
  const { fatal } = useToasterContext()
  const {
    allMarketsAddresses,
    marketsMapper,
    config: { collateralFactor },
    changeLoansSubscriptionsList,
    setMarketAddressToSubscribe,
    isLoading: isLoansLoading,
  } = useLoansContext()

  const [isMarketExistanseLoading, setIsMarketExistanseLoading] = useState(false)
  const [isUserBalancesLoading, setIsUserBalancesLoading] = useState(true)
  const [rawUserTotalBalances, setRawUserTotalBalances] = useState<UserVaultBalances>({
    availableLiquidity: 0,
    userAccruedInterest: 0,
    userTotalBorrowed: 0,
    userTotalCollateral: 0,
  })

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
      [LOANS_CONFIG]: true,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
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
        const marketFromGql = await fetchGraphQLData<{
          lending_controller: Array<{ loan_tokens: Array<{ token: { token_address: string } }> }>
        }>(CHECK_WHETHER_MARKET_EXISTS, { marketAddress: currentMarketAddress ?? '' })

        if (marketFromGql.lending_controller[0]?.loan_tokens?.[0]?.token?.token_address === currentMarketAddress) {
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

  useGraphQLQuery(USER_VAULT_BALANCES_QUERY, {
    skip: !userAddress || !loanToken,
    variables: {
      userAddress: userAddress,
      loanTokenAddress: loanToken?.address ?? '',
    },
    onCompleted: (data: GqlVaultWithBalancesAggregate) => {
      const parsedData = gqlVaultWithBalancesAggregateSchema.safeParse(data)
      if (!parsedData.success) {
        console.error(parsedData.error)
        setIsUserBalancesLoading(false)
        return
      }

      const { total_remaining, loan_interest_total, loan_outstanding_total, token_pool_total } =
        parsedData.data.gql_vault_with_balances_aggregate.aggregate.sum

      const balancesData = {
        availableLiquidity: convertNumberForClient({
          number: total_remaining,
          grade: loanToken?.decimals,
        }),
        userAccruedInterest: convertNumberForClient({
          number: loan_interest_total,
          grade: loanToken?.decimals,
        }),
        userTotalBorrowed: convertNumberForClient({
          number: loan_outstanding_total,
          grade: loanToken?.decimals,
        }),
        userTotalCollateral: convertNumberForClient({
          number: token_pool_total,
          grade: loanToken?.decimals,
        }),
      }

      setRawUserTotalBalances(balancesData)
      setIsUserBalancesLoading(false)
    },
    onError: (error) => console.error(error, 'USER_VAULT_BALANCES_QUERY'),
  })

  const { userTotalBorrowed, userTotalCollateral, userAccruedInterest, userAvailableBorrow } = useMemo(() => {
    const defaultUserTotalBalances = {
      userAvailableBorrow: 0,
      userAccruedInterest: 0,
      userTotalBorrowed: 0,
      userTotalCollateral: 0,
    }

    const userTotalValuesToReturn = { ...defaultUserTotalBalances }

    if (!loanToken?.rate) return defaultUserTotalBalances

    const { decimals: loanTokenDecimals, rate: loanTokenRate } = loanToken

    const vaultCollateralBalance =
      convertNumberForClient({ number: rawUserTotalBalances.userTotalCollateral, grade: loanTokenDecimals }) *
      loanTokenRate

    const convertedBorrowedAmount =
      convertNumberForClient({ number: rawUserTotalBalances.userTotalBorrowed, grade: loanTokenDecimals }) *
      loanTokenRate

    const convertedInterestAmount =
      convertNumberForClient({ number: rawUserTotalBalances.userAccruedInterest, grade: loanTokenDecimals }) *
      loanTokenRate

    const convertedMarketAvailableLiquidity =
      convertNumberForClient({
        number: rawUserTotalBalances.availableLiquidity,
        grade: loanTokenDecimals,
      }) * loanTokenRate

    userTotalValuesToReturn.userTotalBorrowed = convertedBorrowedAmount
    userTotalValuesToReturn.userTotalCollateral = vaultCollateralBalance
    userTotalValuesToReturn.userAccruedInterest = convertedInterestAmount
    userTotalValuesToReturn.userAvailableBorrow = getVaultBorrowCapacity(
      convertedMarketAvailableLiquidity,
      convertedBorrowedAmount + convertedInterestAmount,
      vaultCollateralBalance,
    )

    return userTotalValuesToReturn
  }, [
    loanToken,
    rawUserTotalBalances.userTotalCollateral,
    rawUserTotalBalances.userTotalBorrowed,
    rawUserTotalBalances.userAccruedInterest,
    rawUserTotalBalances.availableLiquidity,
  ])

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
          <Link to={`/loans/${prevMarketAddress}/${tabId}`} state={{ from: historyState?.from }}>
            <span className="left">
              <Icon id="paginationArrowLeft" /> Previous Market
            </span>
          </Link>
        ) : null}

        {nextMarketAddress ? (
          <Link to={`/loans/${nextMarketAddress}/${tabId}`} state={{ from: historyState?.from }}>
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

      {isLoansLoading || isUserBalancesLoading || isMarketExistanseLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading {loanToken?.symbol ?? currentMarketAddress} market</div>
        </DataLoaderWrapper>
      ) : selectedMarket && loanToken && loanToken.rate ? (
        <MarketStyled>
          <div className="gen-info">
            <div className="asset-info">
              <ImageWithPlug useRounded imageLink={loanToken.icon} alt={`${loanToken.icon} icon`} />

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
