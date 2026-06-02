import { Navigate } from 'react-router'

export type ProtectedRouteProps = {
  redirectPath: string
  hasAccess: boolean
  children: React.ReactElement
}

export default function ProtectedRoute({ redirectPath, hasAccess, children }: ProtectedRouteProps) {
  if (!hasAccess) return <Navigate to={redirectPath} />

  return children
}
