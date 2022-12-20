import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { getLoansStorage } from './Loans.actions'
import { Markets } from './Markets/Markets.controller'

export const Loans = () => {
  const dispatch = useDispatch()
  const { wallet, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    ;(async () => {
      await dispatch(getLoansStorage())
    })()
  }, [])

  return (
    <Page>
      <PageHeader page={'lending'} />
      <Markets />
    </Page>
  )
}
