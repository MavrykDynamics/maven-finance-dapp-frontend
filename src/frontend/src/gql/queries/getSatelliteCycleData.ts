export const SATELLITE_CYCLE_DATA_QUERY = `
query GetCurrentCycleGovernanceSatelliteSnapshot($_eq: String = "") {
	governance(where: {active: {_eq: true}}) {
		cycle_id
		satellite_snapshots(where: {user_id: {_eq: $_eq}}, order_by: {cycle: desc}) {
			cycle
			id
			user_id
			governance_id
			ready
			total_delegated_amount
			total_smvk_balance
			total_voting_power
			}
		}
	}
`
export const SATELLITE_CYCLE_DATA_QUERY_NAME = 'GetCurrentCycleGovernanceSatelliteSnapshot'
export function SATELLITE_CYCLE_DATA_QUERY_VARIABLE(_eq: string) {
  return { _eq }
}
