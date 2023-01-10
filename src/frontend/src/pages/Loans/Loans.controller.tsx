import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Markets } from './Markets.controller'

import { getLoansStorage, toggleLoansModal } from './Loans.actions'

import { Page } from 'styles'
import { State } from 'reducers'
import { LoansModals } from './Components/Modals/Modal.controller'

export const Loans = () => {
  const dispatch = useDispatch()
  const { isInitialDataLoading } = useSelector((state: State) => state.loading)
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const { accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    ;(async () => {
      if (!isInitialDataLoading && dipDupTokens.length) {
        await dispatch(getLoansStorage())
      }
    })()
  }, [isInitialDataLoading, dipDupTokens, accountPkh])

  return (
    <Page>
      <PageHeader page={'lending'} />
      <Markets />
    </Page>
  )
}
