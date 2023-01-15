import {
  LoaderShineTextAnimation,
  LoaderStyled,
  LoaderStyledWithBackdrop,
  SpinnerCircleLoaderStyled,
} from './Loader.style'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import { useLockBodyScroll } from 'react-use'

export const LoaderRocket = () => (
  <LoaderStyledWithBackdrop>
    <figure>
      <div>
        <img src="icons/lottie_rocket.gif" />
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
