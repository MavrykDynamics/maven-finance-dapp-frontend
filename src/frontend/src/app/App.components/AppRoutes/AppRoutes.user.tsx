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
  PORTFOLIO_POSITION_TAB_ID,
  PORTFOLIO_TAB_ID,
  SATELLITE_TAB_ID,
} from 'pages/DashboardPersonal/DashboardPersonal.utils'

// --- User app pages ---
const Dashboard = lazy(() =>
  import('pages/Dashboard/Dashboard.controller').then((m) => ({ default: m.Dashboard })),
)
const Doorman = lazy(() => import('pages/Doorman/Doorman.controller').then((m) => ({ default: m.Doorman })))
const Loans = lazy(() => import('pages/Loans/Loans.controller').then((m) => ({ default: m.Loans })))
const Market = lazy(() => import('pages/Loans/Market.controller').then((m) => ({ default: m.Market })))
const LoansDashboard = lazy(() =>
  import('pages/LoansDashboard/LoansDashboard').then((m) => ({ default: m.LoansDashboard })),
)
const LoansEarn = lazy(() =>
  import('pages/LoansEarnBorrow/LoansEarn.controller').then((m) => ({ default: m.LoansEarn })),
)
const LoansBorrow = lazy(() =>
  import('pages/LoansEarnBorrow/LoansBorrow.controller').then((m) => ({ default: m.LoansBorrow })),
)
const Vaults = lazy(() => import('pages/Vaults/Vaults.controller').then((m) => ({ default: m.Vaults })))
const Farms = lazy(() => import('pages/Farms/Farms.controller').then((m) => ({ default: m.Farms })))

// --- Shared pages (also in gov app) ---
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
const Admin = lazy(() => import('pages/Admin/Admin.controller').then((m) => ({ default: m.Admin })))
const RenderErrorPage = lazy(() =>
  import('pages/Error/RenderErrorPage').then((m) => ({ default: m.RenderErrorPage })),
)

// --- Dashboard Personal + sub-routes ---
const DashboardPersonal = lazy(() => import('pages/DashboardPersonal/DashboardPersonal.controller'))
const PortfolioTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/PortfolioTab'))
const SatelliteTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/SatelliteTab'))
const DelegationTab = lazy(() => import('pages/DashboardPersonal/DashboardPersonalComponents/DelegationTab'))
// VestingTab excluded from user app — depends on VestingProvider (gov-only)
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

export const UserRoutes = () => {
  const { isSatellite } = useUserContext()

  return (
    <Routes>
      {/* DASHBOARD */}
      <Route path="/" element={<Dashboard />} />

      <Route path="/dashboard-personal/" element={<DashboardPersonal />}>
        <Route path={`${DELEGATION_TAB_ID}`} element={<DelegationTab />} />
        <Route path={`${SATELLITE_TAB_ID}`} element={<SatelliteTab />} />
        <Route path={`${PORTFOLIO_TAB_ID}/`} element={<PortfolioTab />}>
          <Route path={`${PORTFOLIO_POSITION_TAB_ID}`} element={<LendBorrowPosition />} />
          <Route path={`${PORTFOLIO_LENDING_TAB_ID}`} element={<LoansTxTab txVariant="lending" />} />
          <Route path={`${PORTFOLIO_BORROWING_TAB_ID}`} element={<LoansTxTab txVariant="borrowing" />} />
          <Route
            path="*"
            element={
              <Navigate replace to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
            }
          />
        </Route>
        <Route
          path="*"
          element={
            <Navigate replace to={`/dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`} />
          }
        />
      </Route>

      {/* STAKING */}
      <Route path="/staking" element={<Doorman />} />

      {/* LEND & BORROW */}
      <Route path="/loans" element={<Loans />} />
      <Route path="/loans/dashboard" element={<LoansDashboard />} />
      <Route path="/loans/earn" element={<LoansEarn />} />
      <Route path="/loans/borrow" element={<LoansBorrow />} />
      <Route path="/loans/:assetAddress/:tabId" element={<Market />} />

      {/* VAULTS */}
      <Route path="/vaults/:tabId" element={<Vaults />} />

      {/* FARMS */}
      <Route path="/yield-farms" element={<Farms />} />

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
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<RenderErrorPage />} />
    </Routes>
  )
}
