import { useEffect } from 'react'

import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import {
  DEFAULT_LOANS_ACTIVE_SUBS,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
} from 'providers/LoansProvider/helpers/loans.const'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'

export const Admin = () => {
  const { changeLoansSubscriptionsList } = useLoansContext()
  const { isLoading: isVaultsLoading, changeVaultsSubscriptionsList } = useVaultsContext()

  useEffect(() => {
    changeLoansSubscriptionsList({
      [LOANS_MARKETS_DATA]: true,
      [LOANS_CONFIG]: true,
    })
    changeVaultsSubscriptionsList({
      [VAULTS_DATA]: VAULTS_ALL,
    })

    return () => {
      changeLoansSubscriptionsList(DEFAULT_LOANS_ACTIVE_SUBS)
      changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
    }
  }, [])

  return (
    <Page>
      <PageHeader page={'admin'} />
      {isVaultsLoading ? 'vaults loading, do not use vaults actions)' : null}
    </Page>
  )
}
