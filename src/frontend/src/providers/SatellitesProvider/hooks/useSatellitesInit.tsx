import { useEffect } from 'react'
import { useQuery } from '@apollo/client'

// subs
import { SATELLITES_STORAGE_QUERY } from 'gql/queries/getSatellitesStorage'
import { useSatellitesContext } from '../satellites.provider'

export const useSatellitesInit = (): { isLoading: boolean } => {
  const { updateSatellitesContext } = useSatellitesContext()

  const { data, loading } = useQuery(SATELLITES_STORAGE_QUERY)

  useEffect(() => {
    if (!loading && data) {
      updateSatellitesContext(data)
    }
  }, [loading, updateSatellitesContext])

  return {
    isLoading: loading,
  }
}
