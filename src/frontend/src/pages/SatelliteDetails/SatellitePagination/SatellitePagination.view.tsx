import { Link, useParams } from 'react-router-dom'

import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

// style
import { SatellitePaginationStyled } from './SatellitePagination.style'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'

const SatellitePagination = () => {
  const { satelliteId } = useParams()
  const { allSatellitesIds } = useSatellitesContext()

  const currentSatelliteIndex = allSatellitesIds.findIndex(
    (activeSatelliteAddress) => activeSatelliteAddress === satelliteId,
  )

  const prevSatelliteAddress = allSatellitesIds.at(currentSatelliteIndex - 1) ?? allSatellitesIds.at(-1)
  const nextSatelliteAddress = allSatellitesIds.at(currentSatelliteIndex + 1) ?? allSatellitesIds.at(0)

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
