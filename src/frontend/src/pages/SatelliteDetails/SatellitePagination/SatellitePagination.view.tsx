import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton.controller'

// style
import { SatellitePaginationStyled } from './SatellitePagination.style'

const SatellitePagination = () => {
  const { satelliteId = '' }: { satelliteId: string } = useParams()
  const { activeSatellitesIds } = useSelector((state: State) => state.satellites)

  const currentSatelliteIndex = activeSatellitesIds?.length
    ? activeSatellitesIds.findIndex((activeSatelliteAddress) => activeSatelliteAddress === satelliteId)
    : -1

  const prevSatelliteAddress = currentSatelliteIndex === -1 ? null : activeSatellitesIds?.[currentSatelliteIndex - 1]
  const nextSatelliteAddress = currentSatelliteIndex === -1 ? null : activeSatellitesIds?.[currentSatelliteIndex + 1]

  return (
    <SatellitePaginationStyled>
      <Link to={`/satellite-nodes`} className="go-back">
        <NewButton kind={TRANSPARENT_WITH_BORDER} className="go-back">
          <Icon id="arrowRight" /> Back to satellites
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
