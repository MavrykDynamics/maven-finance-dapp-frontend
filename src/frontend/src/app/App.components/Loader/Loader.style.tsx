import styled, { css } from 'styled-components'
import { shine, ellipsis } from 'styles/animations'
import { MavenTheme } from 'styles/interfaces'
import { SPINNER_LOADER_LARGE, SPINNER_LOADER_MEDIUM, SPINNER_LOADER_SMALL } from './loader.const'

export const LoaderStyledWithBackdrop = styled.div<{ theme: MavenTheme; backdropAlpha?: number; isActive: boolean }>`
  position: fixed;
  z-index: 12;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  font-weight: 600;
  font-size: 18px;

  color: ${({ theme }) => theme.linksAndButtons};

  /* backdrop styles */
  &::after {
    content: '';
    background-color: ${({ theme }) => theme.backgroundColor};
    opacity: ${({ backdropAlpha }) => backdropAlpha ?? 0.5};
    position: absolute;
    z-index: -1;
    inset: 0;
  }

  transition: 250ms opacity ease-out, 250ms visibility ease-out;

  ${({ isActive }) =>
    !isActive
      ? css`
          opacity: 0;
          visibility: hidden;
        `
      : ''};

  figcaption {
    margin-top: -30px;
  }

  img {
    width: 250px;
    height: 200px;
  }
`

export const LoaderShineTextAnimation = styled.div<{ theme: MavenTheme }>`
  background-image: ${({ theme }) => theme.shineAnimationGradient};
  background-size: auto auto;
  background-clip: border-box;
  background-size: 200% auto;
  background-clip: text;
  text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shine} 2s linear infinite;
  font-weight: 600;
  font-size: 26px;
  text-decoration: none;
  white-space: nowrap;
`

export const SpinnerCircleLoaderStyled = styled.div<{ theme: MavenTheme }>`
  color: ${({ theme }) => theme.mainHeadingText};
  font-size: 20px;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  position: relative;
  text-indent: -9999em;
  -webkit-animation: load4 1.3s infinite linear;
  animation: load4 1.3s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  transform: scale(0.1);

  &.${SPINNER_LOADER_SMALL} {
    font-size: 20px;
  }

  &.${SPINNER_LOADER_MEDIUM} {
    font-size: 50px;
  }

  &.${SPINNER_LOADER_LARGE} {
    font-size: 80px;
  }
`

export const ClockLoaderWrapper = styled.svg<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  display: inline-block;
`

export const DataLoaderWrapper = styled.div<{ theme: MavenTheme; margin?: string }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  align-items: center;
  margin: ${({ margin = '150px 0 0 0' }) => margin};

  .text {
    font-size: 18px;
    font-weight: 500;

    &::after {
      overflow: hidden;
      display: inline-block;
      vertical-align: bottom;
      -webkit-animation: ${ellipsis} steps(4, end) 1500ms infinite;
      animation: ${ellipsis} steps(4, end) 1500ms infinite;
      content: '...';
      width: 0px;
      color: ${({ theme }) => theme.mainHeadingText};
    }
  }
`
