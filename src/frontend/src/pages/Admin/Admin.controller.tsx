import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { adminChangeGovernancePeriod, ChangeAllAdminsFromGovernance, trackFarm } from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { AdminView } from './Admin.view'
import { getGovernanceStorage } from '../Governance/Governance.actions'

export const Admin = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getGovernanceStorage())
  }, [dispatch])

  const handleChangeGovernancePeriod = (chosenPeriod: string) => {
    dispatch(adminChangeGovernancePeriod(chosenPeriod))
  }

  const handleTrackFarm = () => {
    dispatch(trackFarm())
  }

  const ChangeAllAdminsFromGov = () => {
    dispatch(ChangeAllAdminsFromGovernance())
    console.log('Here in ChangeAllAdminsFromGov')
  }
  return (
    <Page>
      <PageHeader page={'admin'} />
      <AdminView handleChangeGovernancePeriod={handleChangeGovernancePeriod} handleTrackFarm={handleTrackFarm}
                 handleChangeAllAdminsFromGov={ChangeAllAdminsFromGov} />
    </Page>
  )
}
