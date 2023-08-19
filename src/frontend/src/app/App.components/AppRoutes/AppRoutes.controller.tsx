import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

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
    <Routes>
      <Route path="/staking">
        <Doorman />
      </Route>

      {/* DASHBOARD */}
      <Route path="/">
        <Dashboard />
      </Route>
      <Route path="/dashboard-personal/:tabId/:secondaryTabId?">
        <DashboardPersonal />
      </Route>

      {/* SATELLITES */}
      <Route path="/satellites">
        <Satellites />
      </Route>
      <Route path="/become-satellite">
        <BecomeSatellite />
      </Route>
      <Route path="/satellite-nodes">
        <SatelliteNodes />
      </Route>
      <Route path="/satellites/satellite-details/:satelliteId">
        <SatelliteDetails />
      </Route>
      <Route path="/data-feeds">
        <DataFeeds />
      </Route>
      <Route path="/satellites/feed-details/:feedId">
        <DataFeedDetails />
      </Route>

      {/* GOVERNANCE PAGES */}
      <Route path="/governance">
        <Governance />
      </Route>
      <Route path="/satellite-governance/:tabId?">
        <SatelliteGovernance />
      </Route>
      <Route path="/proposal-history">
        <Governance isHistory />
      </Route>
      <Route path="/contract-status">
        <BreakGlass />
      </Route>
      <Route path="/financial-requests">
        <FinancialRequests />
      </Route>
      <Route path="/emergency-governance">
        <EmergencyGovernance />
      </Route>
      <Route path="/mavryk-council/:tabId?">
        <Council />
      </Route>
      <Route path="/break-glass-council/:tabId?">
        <BreakGlassCouncil />
      </Route>
      <ProtectedRoute
        path="/submit-proposal"
        element={<ProposalSubmission />}
        isAuthorized={Boolean(userAddress)}
        hasAccess={Boolean(isSatellite)}
        redirectPath={'/governance'}
      />

      <Route path="/treasury">
        <Treasury />
      </Route>

      <Route path="/yield-farms">
        <Farms />
      </Route>

      {/* LEND & BORROW */}
      <Route path="/loans/:assetAddress/:tabId">
        <Market />
      </Route>
      <Route path="/loans">
        <Loans />
      </Route>
      <Route path="/vaults/:tabId">
        <Vaults />
      </Route>
      <Route path="/loans/dashboard">
        <LoansDashboard />
      </Route>
      <Route path="/loans/earn">
        <LoansEarn />
      </Route>
      <Route path="/loans/borrow">
        <LoansBorrow />
      </Route>

      {/* NOT PROD PAGES */}
      <Route path="/admin">
        <Admin />
      </Route>

      <Route path="*">
        <RenderErrorPage />
      </Route>
    </Routes>
  )
}
