import type { Aggregator_History_Data } from 'utils/generated/graphqlTypes'
import { Feed } from 'utils/TypesAndInterfaces/DataFeeds'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

type callbackFunction = (arg0: string) => void

// TODO: IDK how to type additional data, maybe revrite logic in future
export type SatellitesListProps = {
  listTitle?: string
  items: Array<Feed> | Array<SatelliteRecord>
  listType: 'satellites' | 'feeds' | 'oracles' | 'userFeeds'
  name: string
  onClickHandler?: (arg0: string) => void
  additionaldata?: Record<string, boolean | number | callbackFunction | string | object>
  pagination?: boolean
  className?: string
}

export type SatelliteListItemProps = {
  satellite: SatelliteRecord
  delegateCallback: (satelliteAddress: string) => void
  claimRewardsCallback?: () => void
  undelegateCallback: (address: string) => void
  userStakedBalance: number
  satelliteUserIsDelegatedTo?: string
  isDetailsPage?: boolean
  userHasSatelliteRewards?: boolean
  className?: string
  children?: JSX.Element
}
