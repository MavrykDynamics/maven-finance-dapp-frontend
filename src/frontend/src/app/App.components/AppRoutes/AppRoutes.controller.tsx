import { useEffect } from 'react'
import { Redirect, Route, Switch, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'

// pages
import { Admin } from '../../../pages/Admin/Admin.controller'
import { BecomeSatellite } from '../../../pages/BecomeSatellite/BecomeSatellite.controller'
import { BreakGlass } from '../../../pages/BreakGlass/BreakGlass.controller'
import { Council } from '../../../pages/Council/Council.controller'
import { BreakGlassCouncil } from 'pages/BreakGlassCouncil/BreakGlassCouncil.controller'
import { Dashboard } from '../../../pages/Dashboard/Dashboard.controller'
import { Doorman } from '../../../pages/Doorman/Doorman.controller'
import { EmergencyGovernance } from '../../../pages/EmergencyGovernance/EmergencyGovernance.controller'
import { Farms } from '../../../pages/Farms/Farms.controller'
import { Governance } from '../../../pages/Governance/Governance.controller'
import { Loans } from '../../../pages/Loans/Loans.controller'
import { SatelliteDetails } from '../../../pages/SatelliteDetails/SatelliteDetails.controller'
import { SatelliteGovernance } from '../../../pages/SatelliteGovernance/SatelliteGovernance.controller'
import { Treasury } from '../../../pages/Treasury/Treasury.controller'
import { Vaults } from '../../../pages/Vaults/Vaults.controller'
import DashboardPersonal from 'pages/DashboardPersonal/DashboardPersonal.controller'
import { LoansDashboard } from 'pages/LoansDashboard/LoansDashboard'
import { ProposalSubmission } from 'pages/ProposalSubmission/ProposalSubmission.controller'
import { LoansEarn } from 'pages/LoansEarnBorrow/LoansEarn.controller'
import { Market } from 'pages/Loans/Market.controller'
import { LoansBorrow } from 'pages/LoansEarnBorrow/LoansBorrow.controller'
import { DataFeeds } from 'pages/DataFeeds/DataFeeds.controller'
import DataFeedDetails from 'pages/DataFeedsDetails/DataFeedsDetails.controler'
import { FinancialRequests } from 'pages/FinacialRequests/FinancialRequests.controller'
import SatelliteNodes from 'pages/SatelliteNodes/SatelliteNodes.controller'
import Satellites from 'pages/Satellites/Satellites.controller'

// providers
import StakeProvider from 'providers/StakeProvider/stake.provider'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import ProtectedRoute from './ProtectedRoute'

export const AppRoutes = () => {
  const { pathname } = useLocation()

  const { userAddress, isSatellite } = useUserContext()

  const { isInitialDataLoading } = useSelector((state: State) => state.loading)

  // get origin pathname
  const [, path] = pathname.split('/')

  // Scroll to the top of the page when moving to others page
  useEffect(() => {
    scrollUpPage()
  }, [path])

  // TODO: add error boundaries
  return (
    <Switch>
      <Route exact path="/staking">
        <StakeProvider>
          <Doorman />
        </StakeProvider>
      </Route>

      {/* DASHBOARD */}
      <Route exact path="/">
        <StakeProvider>
          <Dashboard />
        </StakeProvider>
      </Route>
      <Route exact path="/dashboard-personal/:tabId/:secondaryTabId?">
        <StakeProvider>
          <DashboardPersonal />
        </StakeProvider>
      </Route>

      {/* SATELLITES */}
      <Route exact path="/satellites">
        <StakeProvider>
          <Satellites />
        </StakeProvider>
      </Route>
      <Route exact path="/become-satellite">
        <StakeProvider>
          <BecomeSatellite />
        </StakeProvider>
      </Route>
      <Route exact path="/satellite-nodes">
        <SatelliteNodes />
      </Route>
      <Route exact path="/satellites/satellite-details/:satelliteId">
        <SatelliteDetails />
      </Route>
      <Route exact path="/data-feeds">
        <DataFeeds />
      </Route>
      <Route exact path="/satellites/feed-details/:feedId">
        <DataFeedDetails />
      </Route>

      {/* GOVERNANCE PAGES */}
      <Route exact path="/governance">
        <Governance />
      </Route>
      <Route exact path="/satellite-governance/:tabId?">
        <SatelliteGovernance />
      </Route>
      <Route exact path="/proposal-history">
        <Governance isHistory />
      </Route>
      <Route exact path="/contract-status">
        <BreakGlass />
      </Route>
      <Route exact path="/financial-requests">
        <FinancialRequests />
      </Route>
      <Route exact path="/emergency-governance">
        <StakeProvider>
          <EmergencyGovernance />
        </StakeProvider>
      </Route>
      <Route exact path="/mavryk-council/:tabId?">
        <Council />
      </Route>
      <Route exact path="/break-glass-council/:tabId?">
        <BreakGlassCouncil />
      </Route>
      <ProtectedRoute
        path="/submit-proposal"
        component={ProposalSubmission}
        isAuthorized={Boolean(userAddress)}
        canCheck={!isInitialDataLoading}
        hasAccess={Boolean(isSatellite)}
        redirectPath={'/governance'}
      />

      <Route exact path="/treasury">
        <Treasury />
      </Route>

      <Route exact path="/yield-farms">
        <Farms />
      </Route>

      {/* LEND & BORROW */}
      <Route exact path="/loans/:assetId/:tabId">
        <Market />
      </Route>
      <Route exact path="/loans">
        <Loans />
      </Route>
      <Route exact path="/vaults/:tabId">
        <Vaults />
      </Route>
      <Route exact path="/loans/dashboard">
        <LoansDashboard />
      </Route>
      <Route exact path="/loans/earn">
        <LoansEarn />
      </Route>
      <Route exact path="/loans/borrow">
        <LoansBorrow />
      </Route>

      {/* NOT READY PAGES */}
      <Route exact path="/your-vesting">
        <Dashboard />
      </Route>

      {/* NOT PROD PAGES */}
      <Route exact path="/admin">
        <Admin />
      </Route>

      <Route exact path="/404">
        {/*TODO: Replace later on with actual 404 page*/}
        <Dashboard />
      </Route>

      <Redirect to="/404" />
    </Switch>
  )
}
