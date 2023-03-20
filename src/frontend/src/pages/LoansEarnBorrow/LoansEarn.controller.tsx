import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import { Page } from 'styles'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { LoansEarnBorrow } from './LoansEarnBorrow.view'
import { EarnBorrowTotalCharts } from './Components/EarnBorrowTotalCharts.view'

// types
import { CardSettingsType, CardType } from './LoansEarnBorrow.consts'

const cardSettings: CardSettingsType = {
  priceName: 'Oracle Price',
  totalName: 'Total Earning',
  buttonName: 'Deposit & Earn',
}

// TODO: test data
const cards = [
  {
    title: 'tezos',
    symbol: 'xtz',
    apy: 0.75332,
    price: 0.3223,
    total: 234_233_21,
    id: 1,
    data: [
      {
        time: 1678558660000,
        value: 122,
      },
      {
        time: 1678558765000,
        value: 132.81,
      },
      {
        time: 1678558780000,
        value: 143.62,
      },
      {
        time: 1678616610000,
        value: 170.645,
      },
      {
        time: 1678703630000,
        value: 176.05,
      },
      {
        time: 1678704305000,
        value: 284.15,
      },
      {
        time: 1678710430000,
        value: 305.77,
      },
      {
        time: 1678873925000,
        value: 311.17499999999995,
      },
      {
        time: 1679302820000,
        value: 314.41799999999995,
      },
    ],
  },
] as CardType[]

export const LoansEarn = () => {
  const dispatch = useDispatch()
  // TODO: chartsData - test data
  const { chartsData } = useSelector((state: State) => state.loans)

  return (
    <Page>
      <PageHeader page={'loansEarn'} />
      <EarnBorrowTotalCharts chartsData={chartsData} leftChartTitle="Total Earning" rightChartTitle="Total Borrowing" />
      <LoansEarnBorrow title="Earn" cards={cards} cardSettings={cardSettings} />
    </Page>
  )
}
