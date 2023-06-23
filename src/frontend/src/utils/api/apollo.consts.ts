/**
 * apollo useSubscription has skip prop, and in DAPP we need to have 3 options:
 * 1. use subscription to watch query data changes and update it on change @SUB_SUBSCRIBE
 * 2. load only 1 time, and then forgot it @SUB_QUERY
 * 3. don't even start the query @SUB_SKIP
 *
 * By default hook will set all to @SUB_SUBSCRIBE, so we need to specify into hook args
 * whether we wan't to call query 1 time or don't call it
 */
export const SUB_SKIP = 'skip'
export const SUB_QUERY = 'query'
export const SUB_SUBSCRIBE = 'subscribe'
export type SubscriptionSkipType = typeof SUB_SKIP | typeof SUB_QUERY | typeof SUB_SUBSCRIBE
