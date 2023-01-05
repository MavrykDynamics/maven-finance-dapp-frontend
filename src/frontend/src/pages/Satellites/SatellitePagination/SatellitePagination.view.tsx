import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
// style
import { SatellitePaginationStyled } from './SatellitePagination.style'

const SatellitePagination = () => {
  const params: { satelliteId: string } = useParams()
  const { activeSatellites } = useSelector((state: State) => state.delegation.delegationStorage)
  const satelliteId = params?.satelliteId || ''

  const prevIndex = useMemo(() => {
    return activeSatellites?.length ? activeSatellites.findIndex((item) => item.address === satelliteId) : 0
  }, [activeSatellites, satelliteId])

  const prevSatellite = activeSatellites?.[prevIndex - 1]
  const nextSatellite = activeSatellites?.[prevIndex + 1]

  return (
    <SatellitePaginationStyled>
      <Link to={`/satellite-nodes`} className="back">
        <Button text="Back to satellites" icon="arrowRight" className="arrow" kind={TRANSPARENT_WITH_BORDER} />
      </Link>
      {prevSatellite ? (
        <Link className="pagination-link prev" to={`/satellites/satellite-details/${prevSatellite.address}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous satellite
        </Link>
      ) : null}
      {nextSatellite ? (
        <Link className="pagination-link next" to={`/satellites/satellite-details/${nextSatellite.address}`}>
          Next satellite
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default SatellitePagination
