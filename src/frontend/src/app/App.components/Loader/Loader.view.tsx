import { useSelector } from 'react-redux'
import { useLockBodyScroll } from 'react-use'

import colors from 'styles/colors'
import { State } from 'reducers'
import { ClockLoaderWrapper, LoaderShineTextAnimation, LoaderStyledWithBackdrop } from './Loader.style'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// Page data loader
export const ClockLoader = (props: { width?: number; height?: number; fillColor?: string }) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  
  const { width = 75, height = 75, fillColor = colors[themeSelected]['mainHeadingText'] } = props

  return (
    <ClockLoaderWrapper
      width={width}
      height={height}
      version="1.1"
      id="L5"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
      enableBackground="new 0 0 100 100"
    >
      <circle fill="none" stroke={fillColor} strokeWidth="4" strokeMiterlimit="10" cx="50" cy="50" r="48" />
      <line
        fill="none"
        strokeLinecap="round"
        stroke={fillColor}
        strokeWidth="4"
        strokeMiterlimit="10"
        x1="50"
        y1="50"
        x2="85"
        y2="50.5"
      >
        <animateTransform
          attributeName="transform"
          dur="2s"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          repeatCount="indefinite"
        />
      </line>
      <line
        fill="none"
        strokeLinecap="round"
        stroke={fillColor}
        strokeWidth="4"
        strokeMiterlimit="10"
        x1="50"
        y1="50"
        x2="49.5"
        y2="74"
      >
        <animateTransform
          attributeName="transform"
          dur="15s"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          repeatCount="indefinite"
        />
      </line>
    </ClockLoaderWrapper>
  )
}

export const LottieLoader = ({ isActive, backdropAlpha = 0.5 }: { isActive: boolean; backdropAlpha?: number }) => {
  return (
    <LoaderStyledWithBackdrop isActive={isActive} backdropAlpha={backdropAlpha}>
      <figure>
        <div>
          <img src={`/icons/lottie-rocket.gif?v=0`} alt={`Loader Image`} />
        </div>
      </figure>
    </LoaderStyledWithBackdrop>
  )
}

export const ActionLoader = () => {
  const { isActiveFullScreenLoader } = useSelector((state: State) => state.loading)
  useLockBodyScroll(isActiveFullScreenLoader)
  return <LottieLoader isActive={isActiveFullScreenLoader} />
}

// Wert initialization loader
export const WertLoader = () => {
  const { isWertLoading } = useSelector((state: State) => state.loading)
  useLockBodyScroll(isWertLoading)
  return (
    <LoaderStyledWithBackdrop backdropAlpha={0.8} isActive={isWertLoading}>
      <LoaderShineTextAnimation>Initializating Wert IO widget...</LoaderShineTextAnimation>
    </LoaderStyledWithBackdrop>
  )
}
