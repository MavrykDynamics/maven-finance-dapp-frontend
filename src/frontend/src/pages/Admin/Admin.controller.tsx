import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  addAllCollateralTokensToMarkets,
  addAllLoanTokensToMarkets,
  adminChangeGovernancePeriod,
  ChangeAllAdminsFromGovernance,
  createFarm,
  createTreasuries,
  testErrorCodesChangeAdmin,
} from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { AdminView } from './Admin.view'
import { getLoansStorage } from '../Loans/Actions/getLoansData.actions'
import { getGovernanceStorage } from 'pages/Governance/actions/GovernanseData.actions'

export const Admin = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getLoansStorage())
    dispatch(getGovernanceStorage())
  }, [dispatch])

  const handleChangeGovernancePeriod = (chosenPeriod: string) => {
    dispatch(adminChangeGovernancePeriod(chosenPeriod))
  }

  const handleCreateFarm = () => {
    dispatch(createFarm())
  }

  const handleAddAllCollateralTokensToLendBorrow = () => {
    console.log('Here in add all collateral tokens')
    dispatch(addAllCollateralTokensToMarkets())
  }
  const handleAddAllLoanTokensToLendBorrow = () => {
    console.log('Here in add all loan tokens')
    dispatch(addAllLoanTokensToMarkets())
  }
  const ChangeAllAdminsFromGov = () => {
    dispatch(ChangeAllAdminsFromGovernance())
  }
  const handleCreateAllTreasuries = () => {
    dispatch(createTreasuries())
  }
  const handleErrorCodesTest = () => {
    dispatch(testErrorCodesChangeAdmin())
  }
  return (
    <Page>
      <PageHeader page={'admin'} />
      <AdminView
        handleChangeGovernancePeriod={handleChangeGovernancePeriod}
        handleCreateFarm={handleCreateFarm}
        handleChangeAllAdminsFromGov={ChangeAllAdminsFromGov}
        handleAddAllLoanTokensToLendBorrow={handleAddAllLoanTokensToLendBorrow}
        handleAddAllCollateralTokensToLendBorrow={handleAddAllCollateralTokensToLendBorrow}
        handleCreateAllTreasuries={handleCreateAllTreasuries}
        handleErrorCodesTest={handleErrorCodesTest}
      />
    </Page>
  )
}
