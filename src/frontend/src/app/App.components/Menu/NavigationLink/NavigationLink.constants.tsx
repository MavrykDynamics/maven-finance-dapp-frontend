import { matchPath } from 'react-router-dom'
import { SubNavigationRoute } from 'utils/TypesAndInterfaces/Navigation'

export const PRIMARY = 'primary'
export const SECONDARY = 'secondary'
export const TRANSPARENT = 'transparent'
export type NavigationLinkStyle = typeof PRIMARY | typeof SECONDARY | typeof TRANSPARENT | undefined

export const isSubLinkShown = (
  subNavLink: SubNavigationRoute,
  isUserSatellite: boolean,
  accountPkh?: string,
): boolean => {
  const { isSatellite, isAuth, authNotSatellite } = subNavLink.requires || {}

  // if link requeires user to be logged, and user is not logged => false
  if (isAuth && !accountPkh) {
    return false
  }

  // if link requeires user to be satellite, but he is not => false
  if (isSatellite && !isUserSatellite) {
    return false
  }

  // if link requeires user to be authorized but not a satellite, but he is satellite => false
  if (authNotSatellite && isUserSatellite) {
    return false
  }

  return true
}

export const checkIfLinkSelected = (pathname: string, routePaths: string | string[]) =>
  Boolean(
    Array.isArray(routePaths)
      ? routePaths.find((routePath) => matchPath(pathname, { path: routePath, exact: true, strict: true }))
      : matchPath(pathname, { path: routePaths, exact: true, strict: true }),
  )
