import { useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'

// pages
import { Admin } from '../../../pages/Admin/Admin.controller'
import { BecomeSatellite } from '../../../pages/BecomeSatellite/BecomeSatellite.controller'
import { ContractStatuses } from '../../../pages/ContractStatuses/ContractStatuses.controller'
import { Council } from '../../../pages/Council/Council.controller'
import { BreakGlassCouncil } from 'pages/Council/BreakGlassCouncil.controller'
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
import DataFeedDetails from 'pages/DataFeedsDetails/DataFeedsDetails.controller'
import { FinancialRequests } from 'pages/FinacialRequests/FinancialRequests.controller'
import SatelliteNodes from 'pages/SatelliteNodes/SatelliteNodes.controller'
import Satellites from 'pages/Satellites/Satellites.controller'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import ProtectedRoute from './ProtectedRoute'
import { RenderErrorPage } from 'pages/Error/RenderErrorPage'

export const AppRoutes = () => {
  const { pathname } = useLocation()

  const { userAddress, isSatellite } = useUserContext()

  // get origin pathname
  const [, path] = pathname.split('/')

  // Scroll to the top of the page when moving to others page
  useEffect(() => {
    scrollUpPage()
  }, [path])

  return (
    <Switch>
      <Route exact path="/staking">
        <Doorman />
      </Route>
      {/* DASHBOARD */}
      <Route exact path="/">
        <Dashboard />
      </Route>
      <Route exact path="/dashboard-personal/:tabId/:secondaryTabId?">
        <DashboardPersonal />
      </Route>
      {/* SATELLITES */}
      <Route exact path="/satellites">
        <Satellites />
      </Route>
      <Route exact path="/become-satellite/:tabId">
        <BecomeSatellite />
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
        <ContractStatuses />
      </Route>
      <Route exact path="/financial-requests">
        <FinancialRequests />
      </Route>
      <Route exact path="/emergency-governance">
        <EmergencyGovernance />
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
      <Route exact path="/loans/:assetAddress/:tabId">
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
      {/* NOT PROD PAGES */}
      <Route exact path="/admin">
        <Admin />
      </Route>
      <Route path="*">
        <RenderErrorPage />
      </Route>
    </Switch>
  )
}
