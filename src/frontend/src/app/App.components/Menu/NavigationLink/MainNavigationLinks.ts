import { userNavigationLinks } from './MainNavigationLinks.user'
import { govNavigationLinks } from './MainNavigationLinks.gov'

export const mainNavigationLinks =
  __APP_MODE__ === 'gov' ? govNavigationLinks : userNavigationLinks
