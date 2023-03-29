import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

import MoveToNextRound from '../MoveNextRound/MoveNextRound.controller'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { TimeLeftAreaWrap } from './TimeRemaining.style'

import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import getTimestampByLevel from 'utils/Fetchers/getTimestampByLevel'

export default function TimeRemaining() {
  const { currentRoundEndLevel } = useSelector((state: State) => state.governance.config)
  const [timerDeadline, setTimerDeadline] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    const setTimerData = async () => {
      const duration = await getTimestampByLevel(currentRoundEndLevel)
      setTimerDeadline(new Date(duration).getTime())
      setTimerActive(Boolean(currentRoundEndLevel) && timerDeadline > Date.now())
    }

    setTimerData()
  }, [currentRoundEndLevel, timerDeadline])

  return (
    <TimeLeftAreaWrap showBorder={timerActive}>
      {!timerActive ? (
        <MoveToNextRound />
      ) : (
        <>
          <Timer
            timestamp={timerDeadline}
            options={{
              showZeros: true,
              shownParts: ['h', 'm', 's'],
              timerView: COLON_VIEW,
              showFullDay: true,
              endText: 'remaining',
              defaultColor: '#77A4F2',
            }}
          />
        </>
      )}
    </TimeLeftAreaWrap>
  )
}
