import React, { Suspense } from 'react'
import * as ReactDOM from 'react-dom/client'

import reportWebVitals from './reportWebVitals'
import { unregister } from './serviceWorker'

// Extend Window to include the inline mobile detection flag set in index.html
declare global {
  interface Window {
    __IS_MOBILE?: boolean
  }
}

// Early mobile bail-out: if the inline script in index.html detected mobile UA,
// render only the lightweight Mobile component — skip all providers and desktop JS chunks.
const isMobileDevice = window.__IS_MOBILE === true

// Lazy-load both paths so the entry chunk stays tiny
const LazyMobile = React.lazy(() => import('./app/App.components/Mobile/Mobile.view'))
const LazyDesktopApp = React.lazy(() => import('./DesktopApp').then((mod) => ({ default: mod.DesktopApp })))

const Root = () => {
  return (
    <Suspense fallback={null}>
      {isMobileDevice ? <LazyMobile /> : <LazyDesktopApp />}
    </Suspense>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<Root />)

unregister()
reportWebVitals()
