import { useDispatch } from 'react-redux'
import { useEffect } from 'react'

import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Markets } from './Markets/Markets.controller'

import { getLoansStorage } from './Loans.actions'

import { Page } from 'styles'

export const Loans = () => {
  const dispatch = useDispatch()

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
