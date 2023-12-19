// consts
import { LENDING_TAB_ID } from 'pages/Dashboard/Dashboard.utils'
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT } from 'pages/BecomeSatellite/BecomeSatellite.conts'
import { PORTFOLIO_POSITION_TAB_ID, PORTFOLIO_TAB_ID } from 'pages/DashboardPersonal/DashboardPersonal.utils'

// types
import { MainNavigationRoute } from '../../../../utils/TypesAndInterfaces/Navigation'

export const mainNavigationLinks: MainNavigationRoute[] = [
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
        subPath: `dashboard-personal/${PORTFOLIO_TAB_ID}/${PORTFOLIO_POSITION_TAB_ID}`,
        routeSubPath: '/dashboard-personal/:tabId/:secondaryTabId?',
      },
      // {
      //   id: 59526,
      //   subTitle: 'Vestee Info',
      //   subPath: 'your-vesting',
      //   routeSubPath: '/your-vesting',
      //   disabled: true,
      //   requires: {
      //     isVestee: true,
      //   },
      // },
    ],
  },
  {
    title: 'Earn/Borrow',
    id: 7,
    path: 'loans/dashboard',
    routePath: '/loans/dashboard',
    icon: 'coin-loan',
    subPages: [
      {
        id: 57594,
        subTitle: 'Dashboard',
        subPath: `loans/dashboard`,
        routeSubPath: '/loans/dashboard',
      },
      {
        id: 57000,
        subTitle: 'Earn',
        subPath: `loans/earn`,
        routeSubPath: '/loans/earn',
      },
      {
        id: 57111,
        subTitle: 'Borrow',
        subPath: `loans/borrow`,
        routeSubPath: '/loans/borrow',
      },
      {
        id: 57792,
        subTitle: 'Markets',
        subPath: `loans`,
        routeSubPath: ['/loans', '/loans/:assetAddress/:tabId', '/loans/:assetAddress/:tabId/:cardId'],
      },
    ],
  },
  {
    title: 'Vaults',
    id: 8,
    path: 'vaults/my',
    routePath: '/vaults/:tabId',
    icon: 'vaults',
  },
  {
    title: 'Staking',
    id: 2,
    path: 'staking',
    routePath: '/staking',
    icon: 'menu-staking',
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
      // {
      //   id: 15757,
      //   subTitle: 'Users',
      //   subPath: 'oracle-users',
      //   disabled: true,
      //   routeSubPath: ['/oracle-users', '/satellites/user-details/:tabId'],
      // },
    ],
  },
  {
    title: 'Farms',
    id: 5,
    path: 'yield-farms?isLive=1',
    routePath: '/yield-farms',
    icon: 'plant',
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
  // {
  //   title: 'Admin',
  //   id: 9,
  //   path: 'admin',
  //   routePath: '/admin',
  //   icon: 'settings',
  // },
]
