import {
  DotsLoaderWrapper,
  LoaderShineTextAnimation,
  LoaderStyled,
  LoaderStyledWithBackdrop,
  SpinnerCircleLoaderStyled,
} from './Loader.style'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLockBodyScroll } from 'react-use'
import { lightTextColor } from 'styles'

export const LoaderRocket = () => (
  <LoaderStyledWithBackdrop>
    <figure>
      <div>
        <img src={`/icons/lottie-rocket.gif?v=0`} alt={`Loader Image`} />
      </div>
    </figure>
  </LoaderStyledWithBackdrop>
)

const LoaderWertIo = () => (
  <LoaderStyledWithBackdrop backdropAlpha={0.8}>
    <LoaderShineTextAnimation>Initializating Wert IO widget...</LoaderShineTextAnimation>
  </LoaderStyledWithBackdrop>
)

export const SpinnerLoader = () => (
  <LoaderStyled>
    <div className="loading">
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
      <div className="loading__square"></div>
    </div>
  </LoaderStyled>
)

export const ClockLoader = ({
  width = 75,
  height = 75,
  fillColor = lightTextColor,
}: {
  width?: number
  height?: number
  fillColor?: string
}) => {
  return (
    <DotsLoaderWrapper
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
    </DotsLoaderWrapper>
  )
}

export const SimpleCircleSpinnerLoader = () => {
  return <SpinnerCircleLoaderStyled></SpinnerCircleLoaderStyled>
}

export const ActionLoader = () => {
  const { isActionLoading } = useSelector((state: State) => state.loading)
  useLockBodyScroll(isActionLoading)
  return isActionLoading ? <LoaderRocket /> : null
}

export const WertLoader = () => {
  const { isWertLoading } = useSelector((state: State) => state.loading)
  useLockBodyScroll(isWertLoading)
  return isWertLoading ? <LoaderWertIo /> : null
}
