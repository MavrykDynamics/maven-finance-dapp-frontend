import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  addAllCollateralTokensToMarkets,
  addAllLoanTokensToMarkets,
  adminChangeGovernancePeriod,
  ChangeAllAdminsFromGovernance,
  closeAllOfUsersEmptyVaults,
  createFarm,
  createTreasuries,
} from './Admin.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { AdminView } from './Admin.view'
import { useLoansContext } from 'providers/LoansProvider/loans.provider'
import {
  DEFAULT_LOANS_ACTIVE_SUBS,
  LOANS_CONFIG,
  LOANS_MARKETS_DATA,
} from 'providers/LoansProvider/helpers/loans.const'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'

export const Admin = () => {
  const dispatch = useDispatch()

  const { changeLoansSubscriptionsList } = useLoansContext()
  const { vaultsMapper, changeVaultsSubscriptionsList, isLoading: isVaultsLoading } = useVaultsContext()
  const { collateralTokens, tokensMetadata } = useTokensContext()

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

  const handleChangeGovernancePeriod = (chosenPeriod: string) => {
    dispatch(adminChangeGovernancePeriod(chosenPeriod))
  }

  const handleCreateFarm = () => {
    dispatch(createFarm())
  }

  const handleAddAllCollateralTokensToLendBorrow = () => {
    console.log('Here in add all collateral tokens')
    dispatch(addAllCollateralTokensToMarkets(collateralTokens, tokensMetadata))
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

  const handleCloseUsersEmptyVaults = () => {
    dispatch(closeAllOfUsersEmptyVaults(vaultsMapper))
  }
  return (
    <Page>
      <PageHeader page={'admin'} />
      {isVaultsLoading ? 'vaults loading, do not use vaults actions)' : null}
      <AdminView
        handleChangeGovernancePeriod={handleChangeGovernancePeriod}
        handleCreateFarm={handleCreateFarm}
        handleChangeAllAdminsFromGov={ChangeAllAdminsFromGov}
        handleAddAllLoanTokensToLendBorrow={handleAddAllLoanTokensToLendBorrow}
        handleAddAllCollateralTokensToLendBorrow={handleAddAllCollateralTokensToLendBorrow}
        handleCreateAllTreasuries={handleCreateAllTreasuries}
        handleCloseUsersEmptyVaults={handleCloseUsersEmptyVaults}
      />
    </Page>
  )
}
