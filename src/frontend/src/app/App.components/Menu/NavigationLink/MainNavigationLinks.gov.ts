// consts
import { LENDING_TAB_ID } from 'pages/Dashboard/Dashboard.utils'
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'
import { DELEGATION_TAB_ID } from 'pages/DashboardPersonal/DashboardPersonal.utils'

// types
import { MainNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'

export const govNavigationLinks: MainNavigationRoute[] = [
  {
    title: 'Dashboard',
    id: 1,
    path: `${LENDING_TAB_ID}`,
    routePath: `/${LENDING_TAB_ID}`,
    icon: 'menu-compass',
    subPages: [
      {
        id: 57483,
        subTitle: 'Overview',
        subPath: `${LENDING_TAB_ID}`,
        routeSubPath: `/${LENDING_TAB_ID}`,
      },
      {
        id: 84425,
        subTitle: 'Personal',
        subPath: `dashboard-personal/${DELEGATION_TAB_ID}`,
        routeSubPath: '/dashboard-personal/:tabId',
      },
    ],
  },
  {
    title: 'Satellites',
    id: 3,
    path: 'satellites',
    routePath: '/satellites',
    icon: 'satellite',
    subPages: [
      { id: 57281, subTitle: 'Overview', subPath: 'satellites', routeSubPath: '/satellites' },
      {
        id: 57477,
        subTitle: 'Satellite Nodes',
        subPath: 'satellite-nodes',
        routeSubPath: ['/satellite-nodes', '/satellites/satellite-details/:tabId'],
      },
      {
        id: 55622,
        subTitle: 'Become a Satellite',
        subPath: `become-satellite/${SATELLITE_TAB_EDIT}`,
        routeSubPath: '/become-satellite/:tabId',
        requires: {
          authNotSatellite: true,
        },
      },
      {
        id: 55614,
        subTitle: 'Edit My Profile',
        subPath: `become-satellite/${SATELLITE_TAB_DETAILS}`,
        routeSubPath: '/become-satellite/:tabId',
        requires: {
          isSatellite: true,
        },
      },
      {
        id: 57471,
        subTitle: 'Data Feeds',
        subPath: 'data-feeds',
        routeSubPath: ['/data-feeds', '/satellites/feed-details/:tabId'],
      },
    ],
  },
  {
    title: 'Governance',
    id: 4,
    path: 'governance',
    routePath: '/governance',
    icon: 'hammer',
    subPages: [
      { id: 56179, subTitle: 'Proposals', subPath: 'governance', routeSubPath: '/governance' },
      {
        id: 31471,
        subTitle: 'Proposal History',
        subPath: 'proposal-history',
        routeSubPath: '/proposal-history',
      },
      {
        id: 47294,
        subTitle: 'Satellite Gov.',
        subPath: 'satellite-governance',
        routeSubPath: ['/satellite-governance', '/satellite-governance/:tabId'],
      },
      {
        id: 79754,
        subTitle: 'Maven Council',
        subPath: 'maven-council',
        routeSubPath: ['/maven-council', '/maven-council/:tabId'],
      },
      {
        id: 38374,
        subTitle: 'Break Glass Council',
        subPath: 'break-glass-council',
        routeSubPath: ['/break-glass-council', '/break-glass-council/:tabId'],
      },
      {
        id: 561812,
        subTitle: 'Financial Requests',
        subPath: 'financial-requests',
        routeSubPath: '/financial-requests',
      },
      {
        id: 59416,
        subTitle: 'Submit Proposal',
        subPath: 'submit-proposal',
        routeSubPath: '/submit-proposal',
        requires: {
          isSatellite: true,
        },
      },
      {
        id: 47293,
        subTitle: 'Emergency Gov.',
        subPath: 'emergency-governance',
        routeSubPath: '/emergency-governance',
      },
      {
        id: 35587,
        subTitle: 'Contract Status',
        subPath: 'contract-status',
        routeSubPath: '/contract-status',
      },
    ],
  },
  {
    title: 'Treasury',
    id: 6,
    path: 'treasury',
    routePath: '/treasury',
    icon: 'treasury',
  },
]
