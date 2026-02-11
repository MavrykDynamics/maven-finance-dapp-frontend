import { Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import { RouteLoadingFallback } from './RouteLoadingFallback'
import { RouteErrorBoundary } from './RouteErrorBoundary'

// App-specific route trees
import { UserRoutes } from './AppRoutes.user'
import { GovRoutes } from './AppRoutes.gov'

const isGovApp = __APP_MODE__ === 'gov'

export const AppRoutes = () => {
  const { pathname } = useLocation()

  // get origin pathname
  const [, path] = pathname.split('/')

  // Scroll to the top of the page when moving to others page
  useEffect(() => {
    scrollUpPage()
  }, [path])

  return (
    <RouteErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>{isGovApp ? <GovRoutes /> : <UserRoutes />}</Suspense>
    </RouteErrorBoundary>
  )
}
