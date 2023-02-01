import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'

import { usersData } from '../users.const'

// style
import { SatellitePaginationStyled } from 'pages/Satellites/SatellitePagination/SatellitePagination.style'
import { TRANSPARENT_WITH_BORDER } from 'app/App.components/Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton.controller'

const UsersPagination = () => {
  let { userId = '' } = useParams<{ userId: string }>()

  const prevIndex = useMemo(() => {
    return usersData.findIndex((item) => item.id === userId) || 0
  }, [userId])

  const prevFeed = usersData?.[prevIndex - 1]
  const nextFeed = usersData?.[prevIndex + 1]

  return (
    <SatellitePaginationStyled>
      <Link to={`/oracle-users`} className="go-back">
        <NewButton kind={TRANSPARENT_WITH_BORDER} className="go-back">
          <Icon id="arrowRight" /> Back to users
        </NewButton>
      </Link>
      {prevFeed ? (
        <Link className="pagination-link prev" to={`/satellites/user-details/${prevFeed.id}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous user
        </Link>
      ) : null}
      {nextFeed ? (
        <Link className="pagination-link next" to={`/satellites/user-details/${nextFeed.id}`}>
          Next user
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default UsersPagination
