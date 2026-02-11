import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router'

// helpers
import ProtectedRoute from './ProtectedRoute'
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'
import {
  DELEGATION_TAB_ID,
  PORTFOLIO_BORROWING_TAB_ID,
  PORTFOLIO_LENDING_TAB_ID,
  PORTFOLIO_TAB_ID,
  SATELLITE_TAB_ID,
  VESTING_TAB_ID,
} from 'pages/DashboardPersonal/DashboardPersonal.utils'

// --- Gov app pages ---
const Dashboard = lazy(() =>
  import('pages/Dashboard/Dashboard.controller').then((m) => ({ default: m.Dashboard })),
)
const Governance = lazy(() =>
  import('pages/Governance/Governance.controller').then((m) => ({ default: m.Governance })),
)
const SatelliteGovernance = lazy(() =>
  import('pages/SatelliteGovernance/SatelliteGovernance.controller').then((m) => ({
    default: m.SatelliteGovernance,
  })),
)
const Council = lazy(() => import('pages/Council/Council.controller').then((m) => ({ default: m.Council })))
const BreakGlassCouncil = lazy(() =>
  import('pages/Council/BreakGlassCouncil.controller').then((m) => ({ default: m.BreakGlassCouncil })),
)
const ProposalSubmission = lazy(() =>
  import('pages/ProposalSubmission/ProposalSubmission.controller').then((m) => ({
    default: m.ProposalSubmission,
  })),
)
const FinancialRequests = lazy(() =>
  import('pages/FinancialRequests/FinancialRequests.controller').then((m) => ({ default: m.FinancialRequests })),
)
const Treasury = lazy(() =>
  import('pages/Treasury/Treasury.controller').then((m) => ({ default: m.Treasury })),
)

// --- Shared pages (also in user app) ---
const Satellites = lazy(() => import('pages/Satellites/Satellites.controller'))
const SatelliteNodes = lazy(() => import('pages/SatelliteNodes/SatelliteNodes.controller'))
const SatelliteDetails = lazy(() =>
  import('pages/SatelliteDetails/SatelliteDetails.controller').then((m) => ({ default: m.SatelliteDetails })),
)
const BecomeSatellite = lazy(() =>
  import('pages/BecomeSatellite/BecomeSatellite.controller').then((m) => ({ default: m.BecomeSatellite })),
)
const DataFeeds = lazy(() =>
  import('pages/DataFeeds/DataFeeds.controller').then((m) => ({ default: m.DataFeeds })),
)
const DataFeedDetails = lazy(() => import('pages/DataFeedsDetails/DataFeedsDetails.controller'))
const EmergencyGovernance = lazy(() =>
  import('pages/EmergencyGovernance/EmergencyGovernance.controller').then((m) => ({
    default: m.EmergencyGovernance,
  })),
)
const ContractStatuses = lazy(() =>
  import('pages/ContractStatuses/ContractStatuses.controller').then((m) => ({ default: m.ContractStatuses })),
)
// Admin page excluded from gov app — it depends on LoansProvider + VaultsProvider
const RenderErrorPage = lazy(() =>
  import('pages/Error/RenderErrorPage').then((m) => ({ default: m.RenderErrorPage })),
)

// --- Dashboard Personal + sub-routes ---
const DashboardPersonal = lazy(() => import('pages/DashboardPersonal/DashboardPersonal.controller'))
const PortfolioTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/PortfolioTab'))
const SatelliteTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/SatelliteTab'))
const DelegationTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/DelegationTab'))
const VestingTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/VestingTab'))
const LoansTxTab = lazy(() =>
  import('pages/DashboardPersonal/DashboardPersonalComponents/LoansTxTab').then((m) => ({
    default: m.LoansTxTab,
  })),
)
// LendBorrowPosition excluded from gov app — it depends on LoansProvider

// --- Become Satellite sub-routes ---
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

export const GovRoutes = () => {
  const { isSatellite } = useUserContext()

  return (
    <Routes>
      {/* DASHBOARD */}
      <Route path="/" element={<Dashboard />} />

      <Route path="/dashboard-personal/" element={<DashboardPersonal />}>
        <Route path={`${DELEGATION_TAB_ID}`} element={<DelegationTab />} />
        <Route path={`${SATELLITE_TAB_ID}`} element={<SatelliteTab />} />
        <Route path={`${VESTING_TAB_ID}`} element={<VestingTab />} />
        <Route path={`${PORTFOLIO_TAB_ID}/`} element={<PortfolioTab />}>
          <Route path={`${PORTFOLIO_LENDING_TAB_ID}`} element={<LoansTxTab txVariant="lending" />} />
          <Route path={`${PORTFOLIO_BORROWING_TAB_ID}`} element={<LoansTxTab txVariant="borrowing" />} />
          <Route
            path="*"
            element={
              <Navigate replace to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`} />
            }
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate replace to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_LENDING_TAB_ID}`} />
          }
        />
      </Route>

      {/* GOVERNANCE */}
      <Route path="/governance" element={<Governance />} />
      <Route path="/proposal-history" element={<Governance isHistory />} />
      <Route path="/satellite-governance/:tabId?" element={<SatelliteGovernance />} />
      <Route path="/maven-council/:tabId?" element={<Council />} />
      <Route path="/break-glass-council/:tabId?" element={<BreakGlassCouncil />} />
      <Route path="/financial-requests" element={<FinancialRequests />} />
      <Route
        path="/submit-proposal"
        element={
          <ProtectedRoute hasAccess={Boolean(isSatellite)} redirectPath={'/governance'}>
            <ProposalSubmission />
          </ProtectedRoute>
        }
      />

      {/* TREASURY */}
      <Route path="/treasury" element={<Treasury />} />

      {/* SATELLITES (shared) */}
      <Route path="/satellites" element={<Satellites />} />
      <Route path="/satellite-nodes" element={<SatelliteNodes />} />
      <Route path="/satellites/satellite-details/:satelliteId" element={<SatelliteDetails />} />
      <Route path="/data-feeds" element={<DataFeeds />} />
      <Route path="/satellites/feed-details/:feedId" element={<DataFeedDetails />} />

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

      {/* SHARED */}
      <Route path="/emergency-governance" element={<EmergencyGovernance />} />
      <Route path="/contract-status" element={<ContractStatuses />} />
      <Route path="*" element={<RenderErrorPage />} />
    </Routes>
  )
}
