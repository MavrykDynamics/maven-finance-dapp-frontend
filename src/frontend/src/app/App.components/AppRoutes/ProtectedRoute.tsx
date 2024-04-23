import { Navigate, Route, RouteProps } from 'react-router-dom'

export type ProtectedRouteProps = {
  children: React.ReactElement | null
  isAuthorized: boolean
  hasAccess: boolean
} & RouteProps

export default function ProtectedRoute({ children, hasAccess, isAuthorized, ...routeProps }: ProtectedRouteProps) {
  if (hasAccess) return <Route {...routeProps} />

  return children
}
