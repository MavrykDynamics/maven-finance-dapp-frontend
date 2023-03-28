import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import {
  addAllCollateralTokensToMarkets,
  addAllLoanTokensToMarkets,
  adminChangeGovernancePeriod,
  ChangeAllAdminsFromGovernance,
  createFarm,
  createTreasuries,
} from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { AdminView } from './Admin.view'
import { getLoansStorage } from '../Loans/Actions/getLoansData.actions'
import { getVaultsStorage } from '../Vaults/Vaults.actions'
import { getGovernanceConfig, getGovernanceProposals } from 'pages/Governance/actions/GovernanseData.actions'

export const Admin = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getLoansStorage())
    dispatch(getGovernanceConfig())
    dispatch(getGovernanceProposals())
    dispatch(getVaultsStorage())
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
      />
    </Page>
  )
}
