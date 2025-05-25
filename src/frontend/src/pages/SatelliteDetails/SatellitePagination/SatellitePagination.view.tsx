import { Link, useNavigate, useParams } from 'react-router-dom'

import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

// style
import { SatellitePaginationStyled } from './SatellitePagination.style'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useEffect, useMemo } from 'react'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PAGINATION_ALL,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_ALL_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { sleep } from 'utils/api/sleep'

const SatellitePagination = () => {
  const { satelliteId } = useParams()
  const navigate = useNavigate()
  const {
    allSatellitesIds,
    staelliteIdsByAddress,
    changeSatellitesSubscriptionsList,
    setSatelliteAddressToSubscribe,
    changePage,
    paginationState,
  } = useSatellitesContext()

  const mergedSatelliteIds = useMemo(
    () => [...staelliteIdsByAddress, ...allSatellitesIds],
    [staelliteIdsByAddress, allSatellitesIds],
  )

  const currentSatelliteIndex = mergedSatelliteIds.findIndex(
    (activeSatelliteAddress) => activeSatelliteAddress === satelliteId,
  )

  const prevSatelliteAddress = mergedSatelliteIds.at(currentSatelliteIndex - 1) ?? mergedSatelliteIds.at(-1)
  const nextSatelliteAddress = mergedSatelliteIds.at(currentSatelliteIndex + 1) ?? mergedSatelliteIds.at(0)

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITES_DATA_SINGLE_SUB]: true,
      // [SATELLITE_DATA_SUB]: SATELLITES_DATA_ALL_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
      setSatelliteAddressToSubscribe(null)
    }
  }, [])

  // const handlesatelliteAddressClick = async () => {
  //   if (currentSatelliteIndex === mergedSatelliteIds.length - 1 && mergedSatelliteIds.length > 0) {
  //     sleep(300)
  //     changePage(paginationState[SATELLITE_PAGINATION_ALL] + 1, SATELLITE_PAGINATION_ALL)
  //   } else {
  //     navigate(`/satellites/satellite-details/${nextSatelliteAddress}`)
  //   }
  // }

  return (
    <SatellitePaginationStyled>
      <Link to={`/satellite-nodes`} className="go-back">
        <NewButton kind={BUTTON_SECONDARY}>
          <Icon id="full-arrow-left" /> Back to satellites
        </NewButton>
      </Link>
      {prevSatelliteAddress ? (
        <Link className="pagination-link prev" to={`/satellites/satellite-details/${prevSatelliteAddress}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous satellite
        </Link>
      ) : null}
      {nextSatelliteAddress ? (
        <Link className="pagination-link next" to={`/satellites/satellite-details/${nextSatelliteAddress}`}>
          Next satellite
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default SatellitePagination
