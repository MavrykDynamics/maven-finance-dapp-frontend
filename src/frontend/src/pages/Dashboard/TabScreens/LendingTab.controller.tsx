import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

// consts
import { LOANS_MARKETS_DATA, DEFAULT_LOANS_ACTIVE_SUBS } from 'providers/LoansProvider/helpers/loans.const'
import { BUTTON_WIDE, PRIMARY } from 'app/App.components/Button/Button.constants'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Impact } from 'app/App.components/Impact/Impact'

// styles
import { StatBlock } from '../Dashboard.style'
import { LendingContentStyled, TabWrapperStyled } from './DashboardTabs.style'
import { BGPrimaryTitle } from 'pages/ContractStatuses/ContractStatuses.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// utils
import { getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import useLendBorrow24hDiff from 'providers/LoansProvider/hooks/useLendBorrow24hDiff'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import { TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { LoansContext } from 'providers/LoansProvider/loans.provider.types'

export const LendingTab = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { marketsAddresses, marketsMapper, changeLoansSubscriptionsList, isLoading: isLoansLoading } = useLoansContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
    }
  }, [])

  const { lending24hPersentChange, borrowing24hPersentChange, last24hBorrowingVol, last24hLendingVol } =
    useLendBorrow24hDiff()

  const { lendingSuppliers, borrowers, mostBorrowedAsset, mostLendedAsset, totalBorrowed, totalLended } = useMemo(
    () =>
      reduceLoansData({
        marketsMapper,
        marketsAddresses,
        tokensMetadata,
        tokensPrices,
      }),
    [marketsAddresses, marketsMapper, tokensMetadata, tokensPrices],
  )

  return (
    <TabWrapperStyled backgroundImage="dashboard_lendingTab_bg.png">
      <div className="top">
        <BGPrimaryTitle>Earn/Borrow</BGPrimaryTitle>
        <Link to="/loans" className="dashboard-sectionLink">
          <NewButton kind={PRIMARY} form={BUTTON_WIDE}>
            <Icon id="coin-loan" />
            Earn/Borrow
          </NewButton>
        </Link>
      </div>

      {isLoansLoading ? (
        <DataLoaderWrapper className="tabLoader">
          <ClockLoader width={150} height={150} />
          <div className="text">Loading Earn/Borrow</div>
        </DataLoaderWrapper>
      ) : (
        <LendingContentStyled>
          <div className="left">
            <StatBlock className="large">
              <div className="name">Total Earning</div>
              <div className="value">
                <CommaNumber beginningText="$" value={totalLended} />
                <div className="impact-wrapper">
                  <Impact value={lending24hPersentChange} endingText="% 24h" />
                </div>
              </div>
            </StatBlock>

            <div className="stats-row">
              <StatBlock>
                <div className="name">Suppliers</div>
                <div className="value">
                  <CommaNumber value={lendingSuppliers} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">24H Supply Vol</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={last24hLendingVol} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">Most Supplied Asset</div>
                <div className="value">
                  {mostLendedAsset?.icon ? (
                    <div className="image-wrapper">
                      <img src={mostLendedAsset.icon} alt="" />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}

                  {mostLendedAsset?.symbol || '-'}
                </div>
              </StatBlock>
            </div>
          </div>

          <div className="right">
            <StatBlock className="large">
              <div className="name">Total Borrowed</div>
              <div className="value">
                <CommaNumber beginningText="$" value={totalBorrowed} />
                <div className="impact-wrapper">
                  <Impact value={borrowing24hPersentChange} endingText="% 24h" />
                </div>
              </div>
            </StatBlock>

            <div className="stats-row">
              <StatBlock>
                <div className="name">Borrowers</div>
                <div className="value">
                  <CommaNumber value={borrowers} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">24H Borrow Vol</div>
                <div className="value">
                  <CommaNumber beginningText="$" value={last24hBorrowingVol} />
                </div>
              </StatBlock>
              <StatBlock>
                <div className="name">Most Borrowed Asset</div>
                <div className="value">
                  {mostBorrowedAsset?.icon ? (
                    <div className="image-wrapper">
                      <img src={mostBorrowedAsset.icon} alt="" />
                    </div>
                  ) : (
                    <Icon id="noImage" />
                  )}

                  {mostBorrowedAsset?.symbol ?? ''}
                </div>
              </StatBlock>
            </div>
          </div>
        </LendingContentStyled>
      )}

      <div className="descr">
        <div className="title">How does Mavryk Finance's Earn & Borrow module work?</div>
        <div className="text">
          Mavryk Finance allows its users to put up existing crypto-assets as collateral for a loan, up to a 50%
          loan-to-value ratio. Likewise, suppliers can loan out their crypto-assets to earn interest.{' '}
          <a href="https://blogs.mavryk.finance/" target="_blank" rel="noreferrer">
            Read More
          </a>
        </div>
      </div>
    </TabWrapperStyled>
  )
}

const reduceLoansData = ({
  marketsMapper,
  marketsAddresses,
  tokensMetadata,
  tokensPrices,
}: {
  marketsMapper: LoansContext['marketsMapper']
  marketsAddresses: LoansContext['marketsAddresses']
  tokensMetadata: TokensContext['tokensMetadata']
  tokensPrices: TokensContext['tokensPrices']
}) =>
  marketsAddresses.reduce<{
    lendingSuppliers: number
    borrowers: number
    mostBorrowedAsset: { icon: string; symbol: string } | null
    mostLendedAsset: { icon: string; symbol: string } | null
    prevMostBorrowed: number
    prevMostLended: number
    totalBorrowed: number
    totalLended: number
  }>(
    (acc, marketTokenAddress) => {
      const market = marketsMapper[marketTokenAddress]
      const token = getTokenDataByAddress({ tokenAddress: marketTokenAddress, tokensMetadata, tokensPrices })

      if (!token || !token.rate || !market) return acc

      const { symbol, decimals, icon, rate } = token
      const { suppliers, borrowers, totalBorrowed, totalLended } = market

      const convetedTotalBorrowed = convertNumberForClient({ number: totalBorrowed, grade: decimals }) * rate
      const convetedTotalLended = convertNumberForClient({ number: totalLended, grade: decimals }) * rate

      acc.lendingSuppliers += suppliers
      acc.borrowers += borrowers

      acc.totalBorrowed += convetedTotalBorrowed
      acc.totalLended += convetedTotalLended

      if (acc.prevMostBorrowed < convetedTotalBorrowed) {
        acc.prevMostBorrowed = convetedTotalBorrowed
        acc.mostBorrowedAsset = { symbol, icon }
      }

      if (acc.prevMostLended < convetedTotalLended) {
        acc.prevMostLended = convetedTotalLended
        acc.mostLendedAsset = { symbol, icon }
      }
      return acc
    },
    {
      lendingSuppliers: 0,
      borrowers: 0,
      prevMostBorrowed: 0,
      prevMostLended: 0,
      totalBorrowed: 0,
      totalLended: 0,
      mostBorrowedAsset: null,
      mostLendedAsset: null,
    },
  )
