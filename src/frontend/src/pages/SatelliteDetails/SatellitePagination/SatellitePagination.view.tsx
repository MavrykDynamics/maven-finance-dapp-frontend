import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

// style
import { SatellitePaginationStyled } from './SatellitePagination.style'

const SatellitePagination = () => {
  const { satelliteId = '' }: { satelliteId: string } = useParams()
  const { activeSatellitesIds } = useSelector((state: State) => state.satellites)

  const currentSatelliteIndex = activeSatellitesIds.findIndex(
    (activeSatelliteAddress) => activeSatelliteAddress === satelliteId,
  )

  const prevSatelliteAddress = activeSatellitesIds.at(currentSatelliteIndex - 1) ?? activeSatellitesIds.at(-1)
  const nextSatelliteAddress = activeSatellitesIds.at(currentSatelliteIndex + 1) ?? activeSatellitesIds.at(0)

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
