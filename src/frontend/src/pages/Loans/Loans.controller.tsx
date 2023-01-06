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
  const { isInitialDataloading } = useSelector((state: State) => state.loading)
  const { dipDupTokens } = useSelector((state: State) => state.tokens)

  useEffect(() => {
    ;(async () => {
      if (!isInitialDataloading && dipDupTokens.length) {
        await dispatch(getLoansStorage())
      }
    })()
  }, [isInitialDataloading, dipDupTokens, dispatch])

  return (
    <Page>
      <PageHeader page={'lending'} />
      <Markets />
    </Page>
  )
}
