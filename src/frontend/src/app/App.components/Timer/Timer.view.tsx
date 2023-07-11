import { TimerStyled } from './Timer.style'
import colors from 'styles/colors'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const LETTER_VIEW = 'letter'
export const COLON_VIEW = 'colon'

type TimerViewProps = {
  seconds: number
  minutes: number
  hours: number
  days: number
  options: {
    showZeros?: boolean
    endText?: string
    showFullDay?: boolean
    negativeColor?: string
    defaultColor?: string
    timerView?: typeof LETTER_VIEW | typeof COLON_VIEW
    shownParts?: ('d' | 'h' | 'm' | 's')[]
  }
}

export const TimerView = ({ seconds, minutes, hours, days, options }: TimerViewProps) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()

  const {
    showZeros = true,
    negativeColor = colors[themeSelected]['downColor'],
    endText,
    defaultColor = colors[themeSelected]['primaryText'],
    timerView = LETTER_VIEW,
    shownParts = ['d', 'h', 'm', 's'],
    showFullDay = false,
  } = options
  
  return (
    <TimerStyled negativeColor={negativeColor} defaultColor={defaultColor} timerType={timerView}>
      {showFullDay && days >= 1 ? (
        <span>{`${days} ${days === 1 ? 'day' : 'days'} ${endText}`}</span>
      ) : (
        <ul>
          {timerView === LETTER_VIEW ? (
            showZeros ? (
              <>
                {shownParts.includes('d') && (
                  <li className={days < 0 ? 'negative' : ''}>
                    <span id="days"></span>
                    {days.toString().padStart(2, '0')}d
                  </li>
                )}

                {shownParts.includes('h') && (
                  <li className={hours < 0 ? 'negative' : ''}>
                    <span id="hours"></span>
                    {hours.toString().padStart(2, '0')}h
                  </li>
                )}

                {shownParts.includes('s') && (
                  <li className={minutes < 0 ? 'negative' : ''}>
                    <span id="minutes"></span>
                    {minutes.toString().padStart(2, '0')}m
                  </li>
                )}

                {shownParts.includes('m') && (
                  <li className={seconds < 0 ? 'negative' : ''}>
                    <span id="seconds"></span>
                    {seconds.toString().padStart(2, '0')}s
                  </li>
                )}
                {endText}
              </>
            ) : (
              <>
                {days !== 0 && shownParts.includes('d') && (
                  <li className={days < 0 ? 'negative' : ''}>
                    <span id="days"></span>
                    {days}d
                  </li>
                )}
                {hours !== 0 && shownParts.includes('h') && (
                  <li className={hours < 0 ? 'negative' : ''}>
                    <span id="hours"></span>
                    {hours}h
                  </li>
                )}
                {minutes !== 0 && shownParts.includes('m') && (
                  <li className={minutes < 0 ? 'negative' : ''}>
                    <span id="minutes"></span>
                    {minutes}m
                  </li>
                )}
                {seconds !== 0 && shownParts.includes('s') && (
                  <li className={seconds < 0 ? 'negative' : ''}>
                    <span id="seconds"></span>
                    {seconds}s
                  </li>
                )}
                {endText}
              </>
            )
          ) : null}
          {timerView === COLON_VIEW ? (
            showZeros ? (
              <>
                {shownParts.includes('d') && (
                  <>
                    <li className={days < 0 ? 'negative' : ''}>{days.toString().padStart(2, '0')}</li>:
                  </>
                )}
                {shownParts.includes('h') && (
                  <>
                    <li className={hours < 0 ? 'negative' : ''}>{hours.toString().padStart(2, '0')}</li>:
                  </>
                )}
                {shownParts.includes('m') && (
                  <>
                    <li className={minutes < 0 ? 'negative' : ''}>{minutes.toString().padStart(2, '0')}</li>:
                  </>
                )}
                {shownParts.includes('s') && (
                  <li className={seconds < 0 ? 'negative' : ''}>{seconds.toString().padStart(2, '0')}</li>
                )}
                {endText}
              </>
            ) : (
              <>
                {days !== 0 && shownParts.includes('d') && <li className={days < 0 ? 'negative' : ''}>{days}:</li>}
                {hours !== 0 && shownParts.includes('h') && <li className={hours < 0 ? 'negative' : ''}>{hours}:</li>}
                {minutes !== 0 && shownParts.includes('m') && (
                  <li className={minutes < 0 ? 'negative' : ''}>{minutes}:</li>
                )}
                {seconds !== 0 && shownParts.includes('s') && (
                  <li className={seconds < 0 ? 'negative' : ''}>{seconds}</li>
                )}
                {endText}
              </>
            )
          ) : null}
        </ul>
      )}
    </TimerStyled>
  )
}
