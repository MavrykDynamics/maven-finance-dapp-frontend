import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// Components
import { Timer } from 'app/App.components/Timer/Timer.controller'

// Consts
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'
import { skyColor } from 'styles/colors'

// Actions, helpers
import getTimestampByLevel from 'utils/api/getTimestampByLevel'

// styles
import { SmallTimerWrapper } from './TimeRemaining.style'

export default function TimeRemainingSmall() {
  const { currentRoundEndLevel } = useSelector((state: State) => state.governance.config)

  const [timerDeadline, setTimerDeadline] = useState(0)

  useEffect(() => {
    const setTimerData = async () => {
      try {
        const duration = await getTimestampByLevel(currentRoundEndLevel)
        const convertedToTimestamp = new Date(duration).getTime()
        const isTimestampValid = convertedToTimestamp > Date.now()

        if (isTimestampValid) setTimerDeadline(convertedToTimestamp)
      } catch (e) {
        console.error('TimeRemaining, setTimerData error: ', e)
      }
    }

    setTimerData()
  }, [currentRoundEndLevel])

  return (
    <SmallTimerWrapper>
      <Timer
        timestamp={timerDeadline}
        options={{
          showZeros: true,
          shownParts: ['h', 'm', 's'],
          timerView: COLON_VIEW,
          showFullDay: false,
          defaultColor: skyColor,
        }}
      />
    </SmallTimerWrapper>
  )
}
