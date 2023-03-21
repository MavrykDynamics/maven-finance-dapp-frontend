import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansEarnBorrow } from './LoansEarnBorrow.view'
import { EarnBorrowTotalCharts } from './Components/EarnBorrowTotalCharts.view'

// types
import { CardSettingsType, cards } from './LoansEarnBorrow.consts'

const cardSettings: CardSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Borrowed',
  buttonName: 'Borrow',
  buttonSymbol: true,
}

export const LoansBorrow = () => {
  const dispatch = useDispatch()
  // TODO: chartsData - testing data
  const { chartsData } = useSelector((state: State) => state.loans)

  return (
    <Page>
      <PageHeader page={'loansBorrow'} />
      <EarnBorrowTotalCharts
        // left chart
        leftChartData={chartsData.collateralChartData}
        leftChartTitle="Total Collateral"
        leftTotalAmount={chartsData.totalLended}
        // right chart
        rightChartData={chartsData.borrowingChartData}
        rightChartTitle="Total Borrowing"
        rightTotalAmount={chartsData.totalBorrowed}
      />
      <LoansEarnBorrow title="Borrow" cards={cards} cardSettings={cardSettings} />
    </Page>
  )
}
