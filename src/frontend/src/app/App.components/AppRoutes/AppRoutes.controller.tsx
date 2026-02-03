import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'

// context
import { useUserContext } from 'providers/UserProvider/user.provider'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import ProtectedRoute from './ProtectedRoute'
import { RouteLoadingFallback } from './RouteLoadingFallback'
import { RouteErrorBoundary } from './RouteErrorBoundary'

// consts (small, static — no lazy needed)
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'
import {
  DELEGATION_TAB_ID,
  PORTFOLIO_BORROWING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
} from 'pages/DashboardPersonal/DashboardPersonal.utils'

// --- Lazy-loaded pages (named exports use .then() wrapper) ---
const Admin = lazy(() => import('pages/Admin/Admin.controller').then((m) => ({ default: m.Admin })))
const BecomeSatellite = lazy(() =>
  import('pages/BecomeSatellite/BecomeSatellite.controller').then((m) => ({ default: m.BecomeSatellite })),
)
const ContractStatuses = lazy(() =>
  import('pages/ContractStatuses/ContractStatuses.controller').then((m) => ({ default: m.ContractStatuses })),
)
const Council = lazy(() => import('pages/Council/Council.controller').then((m) => ({ default: m.Council })))
const BreakGlassCouncil = lazy(() =>
  import('pages/Council/BreakGlassCouncil.controller').then((m) => ({ default: m.BreakGlassCouncil })),
)
const Dashboard = lazy(() =>
  import('pages/Dashboard/Dashboard.controller').then((m) => ({ default: m.Dashboard })),
)
const Doorman = lazy(() => import('pages/Doorman/Doorman.controller').then((m) => ({ default: m.Doorman })))
const EmergencyGovernance = lazy(() =>
  import('pages/EmergencyGovernance/EmergencyGovernance.controller').then((m) => ({
    default: m.EmergencyGovernance,
  })),
)
const Farms = lazy(() => import('pages/Farms/Farms.controller').then((m) => ({ default: m.Farms })))
const Governance = lazy(() =>
  import('pages/Governance/Governance.controller').then((m) => ({ default: m.Governance })),
)
const Loans = lazy(() => import('pages/Loans/Loans.controller').then((m) => ({ default: m.Loans })))
const SatelliteDetails = lazy(() =>
  import('pages/SatelliteDetails/SatelliteDetails.controller').then((m) => ({ default: m.SatelliteDetails })),
)
const SatelliteGovernance = lazy(() =>
  import('pages/SatelliteGovernance/SatelliteGovernance.controller').then((m) => ({
    default: m.SatelliteGovernance,
  })),
)
const Treasury = lazy(() =>
  import('pages/Treasury/Treasury.controller').then((m) => ({ default: m.Treasury })),
)
const Vaults = lazy(() => import('pages/Vaults/Vaults.controller').then((m) => ({ default: m.Vaults })))
const DashboardPersonal = lazy(() => import('pages/DashboardPersonal/DashboardPersonal.controller'))
const LoansDashboard = lazy(() =>
  import('pages/LoansDashboard/LoansDashboard').then((m) => ({ default: m.LoansDashboard })),
)
const ProposalSubmission = lazy(() =>
  import('pages/ProposalSubmission/ProposalSubmission.controller').then((m) => ({
    default: m.ProposalSubmission,
  })),
)
const LoansEarn = lazy(() =>
  import('pages/LoansEarnBorrow/LoansEarn.controller').then((m) => ({ default: m.LoansEarn })),
)
const Market = lazy(() => import('pages/Loans/Market.controller').then((m) => ({ default: m.Market })))
const LoansBorrow = lazy(() =>
  import('pages/LoansEarnBorrow/LoansBorrow.controller').then((m) => ({ default: m.LoansBorrow })),
)
const DataFeeds = lazy(() =>
  import('pages/DataFeeds/DataFeeds.controller').then((m) => ({ default: m.DataFeeds })),
)
const DataFeedDetails = lazy(() => import('pages/DataFeedsDetails/DataFeedsDetails.controller'))
const FinancialRequests = lazy(() =>
  import('pages/FinancialRequests/FinancialRequests.controller').then((m) => ({ default: m.FinancialRequests })),
)
const SatelliteNodes = lazy(() => import('pages/SatelliteNodes/SatelliteNodes.controller'))
const Satellites = lazy(() => import('pages/Satellites/Satellites.controller'))
const RenderErrorPage = lazy(() =>
  import('pages/Error/RenderErrorPage').then((m) => ({ default: m.RenderErrorPage })),
)

// Sub-route components
const SatelliteDetailsScreen = lazy(() =>
  import('pages/BecomeSatellite/screens/SatelliteDetails.screen').then((m) => ({
    default: m.SatelliteDetailsScreen,
  })),
)
const BecomeSatelliteScreen = lazy(() =>
  import('pages/BecomeSatellite/screens/BecomeSatellite.screen').then((m) => ({
    default: m.BecomeSatelliteScreen,
  })),
)
const PortfolioTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/PortfolioTab'))
const SatelliteTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/SatelliteTab'))
const DelegationTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/DelegationTab'))
const VestingTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/VestingTab'))
const LoansTxTab = lazy(() =>
  import('pages/DashboardPersonal/DashboardPersonalComponents/LoansTxTab').then((m) => ({
    default: m.LoansTxTab,
  })),
)
const LendBorrowPosition = lazy(() =>
  import('pages/DashboardPersonal/DashboardPersonalComponents/LendBorrowPosition').then((m) => ({
    default: m.LendBorrowPosition,
  })),
)

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
    <RouteErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/staking" element={<Doorman />} />

          {/* DASHBOARD */}
          <Route path="/" element={<Dashboard />} />

          <Route path="/dashboard-personal/" element={<DashboardPersonal />}>
            <Route path={`${DELEGATION_TAB_ID}`} element={<DelegationTab />} />

            <Route path={`${SATELLITE_TAB_ID}`} element={<SatelliteTab />} />

            <Route path={`${VESTING_TAB_ID}`} element={<VestingTab />} />

            <Route path={`${PORTFOLIO_TAB_ID}/`} element={<PortfolioTab />}>
              <Route path={`${PORTFOLIO_POSITION_TAB_ID}`} element={<LendBorrowPosition />} />

              <Route path={`${PORTFOLIO_LENDING_TAB_ID}`} element={<LoansTxTab txVariant="lending" />} />

              <Route path={`${PORTFOLIO_BORROWING_TAB_ID}`} element={<LoansTxTab txVariant="borrowing" />} />

              <Route
                path="*"
                element={
                  <Navigate
                    replace
                    to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}
                  />
                }
              />
            </Route>

            <Route
              path="*"
              element={
                <Navigate
                  replace
                  to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`}
                />
              }
            />
          </Route>

          {/* SATELLITES */}
          <Route path="/satellites" element={<Satellites />} />

          <Route path="/become-satellite" element={<BecomeSatellite />}>
            <Route index path=":tabId" />
            <Route
              path={`${SATELLITE_TAB_DETAILS}`}
              element={
                <ProtectedRoute
                  hasAccess={Boolean(isSatellite)}
                  redirectPath={`/become-satellite/${SATELLITE_TAB_EDIT}`}
                >
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
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  )
}
