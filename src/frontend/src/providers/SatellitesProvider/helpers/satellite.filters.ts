import { Order_By, Satellite_Data_View_Order_By } from 'utils/__generated__/graphql'
import { SatelliteQueryFilterType } from '../satellites.provider.types'

export const getSatelliteByAddressFilters = (userAddress: string): SatelliteQueryFilterType => {
  return {
    where: { registration_timestamp: { _is_null: false }, user_address: { _eq: userAddress } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteActiveFilters = (): SatelliteQueryFilterType => {
  return {
    where: { registration_timestamp: { _is_null: false }, currently_registered: { _eq: true }, status: { _eq: '0' } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteAllFilters = (): SatelliteQueryFilterType => {
  return {
    where: { registration_timestamp: { _is_null: false } },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

export const getSatelliteOracleFilters = (): SatelliteQueryFilterType => {
  return {
    where: {
      registration_timestamp: { _is_null: false },
      _and: {
        // @ts-expect-error // _and is not typed
        last_observation_timestamp: { _is_null: false },
      },
    },
    orderBy: { currently_registered: Order_By.Desc },
  }
}

// <order_by> (sort) --------------
export const getSatelliteOrderByQuery = (option: string): { orderBy?: Satellite_Data_View_Order_By } => {
  switch (option) {
    case 'Lowest Fee':
      return { orderBy: { fee: Order_By.Asc } }
    case 'Highest Fee':
      return { orderBy: { fee: Order_By.Desc } }
    case 'Delegated MVN':
      return { orderBy: { total_delegated_amount: Order_By.Desc } }
    case 'Participation':
      return {
        orderBy: {
          participation_rate: Order_By.Desc,
        },
      }
    default:
      return { orderBy: { currently_registered: Order_By.Desc } }
  }
}

// search query
export const getSatelliteSearchQueryForWhereFilter = (searchValue: string) => {
  if (!searchValue) return { where: {} }
  return {
    where: {
      _or: [{ name: { _ilike: searchValue } }, { user: { address: { _eq: searchValue } } }],
    },
  }
}
