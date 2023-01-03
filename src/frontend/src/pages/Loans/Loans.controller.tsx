import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Markets } from './Components/Markets.controller'

import { getLoansStorage, toggleLoansModal } from './Loans.actions'

import { Page } from 'styles'
import { State } from 'reducers'
import { LoansModals } from './Components/Modals/Modal.controller'
import { UPDATE_MVK_OPERATORS_MODAL_ID } from './Loans.const'

export const Loans = () => {
  const dispatch = useDispatch()
  const { isInitialDataloading } = useSelector((state: State) => state.loading)
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const { currentModalActive } = useSelector((state: State) => state.loans)

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
      <LoansModals activeModal={UPDATE_MVK_OPERATORS_MODAL_ID} closePopup={() => dispatch(toggleLoansModal(null))} />
    </Page>
  )
}
