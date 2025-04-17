import qs from 'qs'
import { ParsedQs } from 'qs'

export const COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME = 'allPendingActions'
export const COUNCIL_ALL_PAST_ACTIONS_LIST_NAME = 'allPastActions'
export const COUNCIL_MY_PENDING_ACTIONS_LIST_NAME = 'myPendingActions'
export const COUNCIL_MY_PAST_ACTIONS_LIST_NAME = 'myPastActions'

export const EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME = 'emergencyGovHistory'

export const PAST_REQUESTS_FINANCIAL_REQUESTS_LIST = 'pastFR'
export const ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST = 'ongoingFR'

export const ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'ongoingActionsSatelliteGov'
export const PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'pastActionsSatelliteGov'
export const MY_ACTIONS_SATELLITE_GOVERNANCE_LIST = 'myActionsSatelliteGov'

export const TRANSACTION_HISTORY_TABLE_NAME = 'transactionHistoryTable'
export const USER_ACTIONS_HISTORY = 'userActionsHistory'

export const SATELITES_OVERVIEW_LIST_NAME = 'saletitesGov'
export const SATELITES_TOP_LIST_NAME = 'topSatelitesOracle'
export const FEEDS_TOP_LIST_NAME = 'topDataFeedsOracle'
export const FEEDS_ALL_LIST_NAME = 'allDataFeedsOracle'
export const ORACLES_DATA_IN_FEED_LIST_NAME = 'oraclesDataFromFeed'
export const USER_DATA_FEEDS_LIST_NAME = 'userDataFeeds'
export const SATELITES_NODES_LIST_NAME = 'satelitesNodes'
export const SATELLITES_OVERVIEW_LIST_NAME = 'satellitesOverviewList'

export const WAITING_EXECUTED_PROPOSALS_LIST_NAME = 'waitingProposals'
export const WAITING_PAYMENT_PROPOSALS_LIST_NAME = 'waitingFPProposals'
export const HISTORY_PROPOSALS_LIST_NAME = 'historyProposals'
export const ONGOING_PROPOSALS_LIST_NAME = 'ongoingProposals'
export const GOVERNANCE_VOTERS_LIST_NAME = 'govVotets'

export const FARMS_VERTICAL_CARDS = 'farmsVertical'
export const FARMS_HORIZONTAL_CARDS = 'farmsHorizontal'

export const BREAK_GLASS_LIST_NAME = 'breakGlass'

export const VAULTS_LIST_NAME = 'vaults'
export const MY_VAULTS_LIST_NAME = 'myVaults'
export const PERMISSIONED_VAULTS_LIST_NAME = 'permissionedVaults'

export const LOANS_POSITION_TABLE = 'loansPositionTable'
export const BORROW_LIST_NAME = 'borrowVaultsPerMarket'

export const LIST_NAMES_MAPPER: Record<string, number> = {
  [COUNCIL_ALL_PENDING_ACTIONS_LIST_NAME]: 8,
  [COUNCIL_ALL_PAST_ACTIONS_LIST_NAME]: 8,
  [COUNCIL_MY_PENDING_ACTIONS_LIST_NAME]: 8,
  [COUNCIL_MY_PAST_ACTIONS_LIST_NAME]: 8,
  [EMERGENCY_GOVERNANCE_HISTORY_LIST_NAME]: 5,
  [USER_ACTIONS_HISTORY]: 8,
  [TRANSACTION_HISTORY_TABLE_NAME]: 9,
  [PAST_REQUESTS_FINANCIAL_REQUESTS_LIST]: 8,
  [ONGOING_REQUESTS_FINANCIAL_REQUESTS_LIST]: 8,
  [ONGOING_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [PAST_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [MY_ACTIONS_SATELLITE_GOVERNANCE_LIST]: 7,
  [WAITING_EXECUTED_PROPOSALS_LIST_NAME]: 10,
  [WAITING_PAYMENT_PROPOSALS_LIST_NAME]: 10,
  [LOANS_POSITION_TABLE]: 10,
  [HISTORY_PROPOSALS_LIST_NAME]: 10,
  [ONGOING_PROPOSALS_LIST_NAME]: 10,
  [GOVERNANCE_VOTERS_LIST_NAME]: 10,
  [SATELITES_TOP_LIST_NAME]: 3,
  [SATELITES_NODES_LIST_NAME]: 5,
  [FEEDS_TOP_LIST_NAME]: 5,
  [ORACLES_DATA_IN_FEED_LIST_NAME]: 5,
  [USER_DATA_FEEDS_LIST_NAME]: 3,
  [FEEDS_ALL_LIST_NAME]: 10,
  [SATELLITES_OVERVIEW_LIST_NAME]: 10,
  [FARMS_VERTICAL_CARDS]: 9,
  [FARMS_HORIZONTAL_CARDS]: 12,
  [BREAK_GLASS_LIST_NAME]: 8,
  [VAULTS_LIST_NAME]: 10,
  [MY_VAULTS_LIST_NAME]: 10,
  [PERMISSIONED_VAULTS_LIST_NAME]: 10,
  [BORROW_LIST_NAME]: 10,
}

export const calculateSlicePositions = (currentPage: number, listName: string) => {
  const itemsPerPage = LIST_NAMES_MAPPER[listName]
  return [(currentPage - 1) * itemsPerPage, currentPage * itemsPerPage]
}

export const getPageNumber = (search: string, listName: string): number => {
  const { page = {} } = qs.parse(search, { ignoreQueryPrefix: true })
  return Number((page as Record<string, string>)?.[listName]) || 1
}

export const getTotalPages = (totalItems: number, limit: number) => Math.ceil(totalItems / limit)

export const updatePageInUrl = ({
  page,
  newPage,
  listName,
  pathname,
  restQP,
}: {
  page: string | ParsedQs | string[] | ParsedQs[]
  newPage: number
  listName: string
  pathname: string
  restQP: object
}) => {
  const { [listName]: removedEl, ...newPageParams } = page as Record<string, string>

  if (Number(newPage) !== 1) {
    newPageParams[listName] = newPage.toString()
  }

  const newQueryParams = {
    ...restQP,
    page: newPageParams,
  }
  return pathname + qs.stringify(newQueryParams, { addQueryPrefix: true })
}

export const PAGINATION_SIDE_RIGHT = 'right'
export const PAGINATION_SIDE_CENTER = 'center'
export const PAGINATION_SIDE_LEFT = 'left'

export type PaginationPlacementVariants =
  | typeof PAGINATION_SIDE_RIGHT
  | typeof PAGINATION_SIDE_LEFT
  | typeof PAGINATION_SIDE_CENTER

export type PaginationProps = {
  itemsCount: number
  side?: PaginationPlacementVariants
  listName: string
  className?: string
}
