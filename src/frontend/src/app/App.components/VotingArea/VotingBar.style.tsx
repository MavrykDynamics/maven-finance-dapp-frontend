import styled, { css } from 'styled-components/macro'
import { dropShadow } from 'styles/animations'
import { MavrykTheme } from 'styles/interfaces'
import { getNumberInBounds } from 'utils/calcFunctions'
import { DEFAULT_Z_INDEX_FOR_OVERLAP } from 'styles/constants'

export const VotingContainer = styled.aside<{ theme: MavrykTheme; showButtons?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: ${({ showButtons }) => (showButtons ? 0 : '30px')};
  text-align: end;
  width: 100%;
  position: relative;
`

/**
 * @width – represent quorum persent, if it's <= 50 we display persent pointer line on the left, otherwise on the right
 */
export const QuorumBar = styled.div<{ width: number; theme: MavrykTheme }>`
  width: 100%;

  .text {
    color: ${({ theme }) => theme.mainHeadingText};
    top: -27px;
    font-weight: 400;
    font-size: 12px;
    width: fit-content;
    position: absolute;
    left: ${({ width }) => getNumberInBounds(0, 100, width)}%;
    transform: ${({ width }) => (width <= 50 ? 'translateX(6px)' : 'translateX(calc(-100% - 6px))')};
    white-space: nowrap;

    &::before {
      content: '';
      position: absolute;
      height: 20px;
      width: 1px;
      background: ${({ theme }) => theme.mainHeadingText};
      top: 50%;
      ${({ width }) => css`
        ${width <= 50 ? 'left' : 'right'}: -5px;
      `};
      transform: translateY(-50%);
    }
  }
`
export const VotingBarStyled = styled.div<{ theme: MavrykTheme }>`
  z-index: ${DEFAULT_Z_INDEX_FOR_OVERLAP};
  height: 4px;
  display: flex;
  flex-direction: row;

  > div {
    height: 100%;
    min-width: 7%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative;

    > div:not(.voting-tooltip) {
      font-size: 12px;
      margin-top: 14px;
      position: absolute;
      left: 0;
      overflow: hidden;
      width: 100%;
      text-align: center;
      text-overflow: ellipsis;
    }
  }
`

export const VotingFor = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 10px 0 0 10px;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.upColor};
  color: ${({ theme }) => theme.upColor};
  animation: ${({ theme }) => dropShadow(theme.upColor)} 10s ease-in-out 0s infinite normal forwards;
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`

export const VotingAgainst = styled.div<{ width: number; theme: MavrykTheme }>`
  border-radius: 0 10px 10px 0;
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.downColor};
  color: ${({ theme }) => theme.downColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
export const VotingAbstention = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.neutralColor};
  color: ${({ theme }) => theme.neutralColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
export const NotYetVoted = styled.div<{ width: number; theme: MavrykTheme }>`
  width: ${({ width }) => width}%;
  background-color: ${({ theme }) => theme.neutralSecondaryColor};
  color: ${({ theme }) => theme.neutralSecondaryColor};
  cursor: pointer;

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }
  }
`
