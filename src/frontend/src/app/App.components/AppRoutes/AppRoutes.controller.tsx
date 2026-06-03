import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'

// helpers
import { scrollUpPage } from 'utils/scrollUpPage'
import { RouteLoadingFallback } from './RouteLoadingFallback'
import { RouteErrorBoundary } from './RouteErrorBoundary'

// App-specific route trees — lazy so Vite tree-shakes the unused app
const AppRouteTree = lazy(() =>
  __APP_MODE__ === 'gov'
    ? import('./AppRoutes.gov').then((m) => ({ default: m.GovRoutes }))
    : import('./AppRoutes.user').then((m) => ({ default: m.UserRoutes })),
)

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
      <Suspense fallback={<RouteLoadingFallback />}>
        <AppRouteTree />
      </Suspense>
    </RouteErrorBoundary>
  )
}
