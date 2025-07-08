import { Link, To, useLocation, useNavigate } from 'react-router-dom'

import { BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import NewButton from 'app/App.components/Button/NewButton'

// style
import { SatellitePaginationStyled } from './SatellitePagination.style'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { forwardRef, useEffect, useMemo } from 'react'
import { SATELLITE_PAGINATION_ALL } from 'providers/SatellitesProvider/satellites.const'
import { satelliteNodesPath } from 'pages/SatelliteNodes/satelliteNodes.const'

type SatellitePaginationpProps = {
  currentSatelliteIdx: number
  setCurrentSatelliteAddressIndex: (value: number) => void
}

const SatellitePagination = forwardRef<boolean, SatellitePaginationpProps>(
  ({ currentSatelliteIdx, setCurrentSatelliteAddressIndex }, ref) => {
    const navigate = useNavigate()

    const { state } = useLocation()

    const { allSatellitesIds, staelliteIdsByAddress, paginationState, changePage, isLoading } = useSatellitesContext()
    const satelliteFromParamsIdx = useMemo(
      () => allSatellitesIds.findIndex((id) => id === staelliteIdsByAddress?.[0]),
      [allSatellitesIds, staelliteIdsByAddress],
    )

    const mergedSatelliteIds = useMemo(() => {
      return satelliteFromParamsIdx !== -1 ? allSatellitesIds : [...staelliteIdsByAddress, ...allSatellitesIds]
    }, [allSatellitesIds, satelliteFromParamsIdx, staelliteIdsByAddress])

    // only run when new batch is fetched
    useEffect(() => {
      if (satelliteFromParamsIdx !== -1) {
        setCurrentSatelliteAddressIndex(satelliteFromParamsIdx)
      }
    }, [satelliteFromParamsIdx])

    const handleNext = () => {
      const isLastSatellite = currentSatelliteIdx === mergedSatelliteIds.length - 1

      if (isLastSatellite) {
        // Trigger pagination and reset index
        if (ref && typeof ref !== 'function') {
          ref.current = true
        }

        setCurrentSatelliteAddressIndex(1)
        changePage(paginationState[SATELLITE_PAGINATION_ALL] + 1, SATELLITE_PAGINATION_ALL)
      } else {
        // go to the next satellite in the current list
        const nextIdx = currentSatelliteIdx + 1
        setCurrentSatelliteAddressIndex(nextIdx)
        navigate(`/satellites/satellite-details/${mergedSatelliteIds[nextIdx]}`, {
          replace: true,
        })
      }
    }

    const handlePrev = () => {
      if (currentSatelliteIdx <= 0) return

      const prevIdx = currentSatelliteIdx - 1
      setCurrentSatelliteAddressIndex(prevIdx)

      navigate(`/satellites/satellite-details/${mergedSatelliteIds[prevIdx]}`, { replace: true })
    }

    return (
      <SatellitePaginationStyled>
        <Link to={state?.fromNodesPage ? (-1 as To) : satelliteNodesPath} className="go-back">
          <NewButton kind={BUTTON_SECONDARY} disabled={isLoading}>
            <Icon id="full-arrow-left" /> Back to satellites
          </NewButton>
        </Link>
        {currentSatelliteIdx > 0 && (
          <button className="pagination-link prev" onClick={handlePrev}>
            <Icon id="arrow-obtuse-angle" />
            Previous satellite
          </button>
        )}
        <button className="pagination-link next" onClick={handleNext} disabled={isLoading}>
          Next satellite
          <Icon id="arrow-obtuse-angle" />
        </button>
      </SatellitePaginationStyled>
    )
  },
)

export default SatellitePagination
