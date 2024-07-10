import { keyframes } from 'styled-components'

export const clickWave = (color: string) => keyframes`
  from {
    box-shadow: 0 0 0 0 ${color};
  }
  to {
    box-shadow: 0 0 0 5px ${color}00;
  }
`

export const loadingDotsAnimation = () => keyframes`
	0% {
    box-shadow: 15px 0 rgb(134, 212, 201), -15px 0 rgb(134, 212, 201, 0.3);
    background: rgb(134, 212, 201);
  }
  33% {
    box-shadow: 15px 0 rgb(134, 212, 201), -15px 0 rgb(134, 212, 201, 0.3);
    background: rgb(134, 212, 201, 0.3);
  }
  66% {
    box-shadow: 15px 0 rgb(134, 212, 201, 0.3), -15px 0 rgb(134, 212, 201);
    background: rgb(134, 212, 201, 0.3);
  }
  100% {
    box-shadow: 15px 0 rgb(134, 212, 201, 0.3), -15px 0 rgb(134, 212, 201);
    background: rgb(134, 212, 201);
  }
`

export const clickSlide = keyframes`
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(100px);
  }
`

export const turn = keyframes`
  100% {
      transform: rotate(360deg);
  }
`

export const zoomIn = keyframes`
  from {
    transform:scale(.2);
    opacity:0
  }
  to {
    transform:scale(1);
    opacity:1
  }
`

export const slideDown = keyframes`
  from {
    transform: translate3d(0, -10px, 0);
    opacity:0
  }
  to {
    transform: translate3d(0, 0px, 0);
    opacity:1
  }
`

export const shine = keyframes`
  from {
    background-position: 200% center;
  }
`

export const ellipsis = keyframes`
  to {
    width: 18px;
  }
`

export const decreaseBar = keyframes`
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(470px, 0, 0);
  }
`

export const dropShadow = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color};
  }

  100% {
    box-shadow: 0 0 10px 0 ${color};
  }
`

// toasts animation
/**
 *
 * @param distance how many pixles (f.e. 200 | 500 etc.)
 * @returns animation keyframe
 */
export const revealFromRight = (distance: number) => keyframes`
  0% {
    transform: translateX(${distance}px);
  }

  100% {
    transform: translateX(0);
  }
`

/**
 *
 * @param distance how many pixles (f.e. 200 | 500 etc.)
 * @returns animation keyframe
 */
export const hideToRight = (distance: number) => keyframes`
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(${distance}px);
  }
`

// error page animation
export const hangInSpace = () => keyframes`
  0% {
    transform: translate(0, 0) rotate(0);
  }
  50% {
    transform: translate(-50px, -150px) rotate(360deg);
  }
  100% {
    transform: translate(50px, 50px) rotate(180deg);
  }
`
