import { useEffect } from 'react'
import { Navigate, Route, Routes as Switch, useLocation } from 'react-router-dom'

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
import { FinancialRequests } from 'pages/FinancialRequests/FinancialRequests.controller'
import SatelliteNodes from 'pages/SatelliteNodes/SatelliteNodes.controller'
import Satellites from 'pages/Satellites/Satellites.controller'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import ProtectedRoute from './ProtectedRoute'
import { RenderErrorPage } from 'pages/Error/RenderErrorPage'
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'
import { SatelliteDetailsScreen } from 'pages/BecomeSatellite/screens/SatelliteDetails.screen'
import { BecomeSatelliteScreen } from 'pages/BecomeSatellite/screens/BecomeSatellite.screen'
import {
  DELEGATION_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
} from 'pages/DashboardPersonal/DashboardPersonal.utils'
import PortfolioTab from 'pages/DashboardPersonal/DashboardPersonalComponents/PortfolioTab'
import SatelliteTab from 'pages/DashboardPersonal/DashboardPersonalComponents/SatelliteTab'
import DelegationTab from 'pages/DashboardPersonal/DashboardPersonalComponents/DelegationTab'
import VestingTab from 'pages/DashboardPersonal/DashboardPersonalComponents/VestingTab'

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
      <Route path="/staking" element={<Doorman />} />

      {/* DASHBOARD */}
      <Route path="/" element={<Dashboard />} />

      <Route path="/dashboard-personal/:tabId/:secondaryTabId?" element={<DashboardPersonal />}>
        <Route path={`${DELEGATION_TAB_ID}`} element={<DelegationTab />} />

        <Route path={`${SATELLITE_TAB_ID}`} element={<SatelliteTab />} />

        <Route path={`${VESTING_TAB_ID}`} element={<VestingTab />} />

        <Route path={`${PORTFOLIO_TAB_ID}/:secondaryTabId?`} element={<PortfolioTab />} />

        <Route
          path="*"
          element={<Navigate replace to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />}
        />
      </Route>

      {/* SATELLITES */}
      <Route path="/satellites" element={<Satellites />} />

      <Route path="/become-satellite" element={<BecomeSatellite />}>
        <Route index path=":tabId" />
        <Route
          path={`${SATELLITE_TAB_DETAILS}`}
          element={
            <ProtectedRoute hasAccess={Boolean(isSatellite)} redirectPath={`/become-satellite/${SATELLITE_TAB_EDIT}`}>
              <>
                <SatelliteDetailsScreen />
              </>
            </ProtectedRoute>
          }
        />

        <Route path={`${SATELLITE_TAB_EDIT}`} element={<BecomeSatelliteScreen />} />

        <Route path="*" element={<Navigate replace to={`/become-satellite/${SATELLITE_TAB_EDIT}`} />} />
      </Route>

      <Route path="/satellite-nodes" element={<SatelliteNodes />} />

      <Route path="/satellites/satellite-details/:satelliteId" element={<SatelliteDetails />} />

      <Route path="/data-feeds" element={<DataFeeds />} />

      <Route path="/satellites/feed-details/:feedId" element={<DataFeedDetails />} />

      {/* GOVERNANCE PAGES */}
      <Route path="/governance" element={<Governance />} />

      <Route path="/satellite-governance/:tabId?" element={<SatelliteGovernance />} />

      <Route path="/proposal-history" element={<Governance isHistory />} />

      <Route path="/contract-status" element={<ContractStatuses />} />

      <Route path="/financial-requests" element={<FinancialRequests />} />

      <Route path="/emergency-governance" element={<EmergencyGovernance />} />

      <Route path="/maven-council/:tabId?" element={<Council />} />

      <Route path="/break-glass-council/:tabId?" element={<BreakGlassCouncil />} />

      <Route
        path="/submit-proposal"
        element={
          <ProtectedRoute hasAccess={Boolean(isSatellite)} redirectPath={'/governance'}>
            <ProposalSubmission />
          </ProtectedRoute>
        }
      />

      <Route path="/treasury" element={<Treasury />} />

      <Route path="/yield-farms" element={<Farms />} />

      {/* LEND & BORROW */}
      <Route path="/loans/:assetAddress/:tabId" element={<Market />} />

      <Route path="/loans" element={<Loans />} />

      <Route path="/vaults/:tabId" element={<Vaults />} />

      <Route path="/loans/dashboard" element={<LoansDashboard />} />

      <Route path="/loans/earn" element={<LoansEarn />} />

      <Route path="/loans/borrow" element={<LoansBorrow />} />

      {/* NOT PROD PAGES */}
      <Route path="/admin" element={<Admin />} />

      <Route path="*" element={<RenderErrorPage />} />
    </Switch>
  )
}
