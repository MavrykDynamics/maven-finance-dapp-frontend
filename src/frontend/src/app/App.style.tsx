import styled, { css } from 'styled-components'

import { MavenTheme } from '../styles/interfaces'

export const AppStyled = styled.div<{
  theme: MavenTheme
  $isExpandedMenu?: boolean
}>`
  --carousel-button-size: 30px;
  --carousel-button-bg: rgb(22 14 63 / 70%);
  --carousel-button-indent: -15px;
  min-height: 100vh;
  padding-left: ${({ $isExpandedMenu }) => ($isExpandedMenu ? '232px' : '72px')};

  @media screen and (max-width: 1399px) {
    padding-left: 72px;
  }
`

export const FullScreenLoadingApp = styled.div<{ theme: MavenTheme }>`
  position: fixed;
  background-color: ${({ theme }) => theme.loaderBackgroundColor};
  width: 100vw;
  height: 100vh;
`

export const EmptyContainer = styled.figure<{ theme: MavenTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.regularText};
  font-size: 18px;
  font-weight: 600;
  flex-direction: column;
  padding-top: 80px;

  & ~ figure {
    display: none;
  }

  &.centered {
    margin: 50px auto 0 auto;
  }
`

export const Truncate = styled.div<{ maxWidth?: number }>`
  text-overflow: ellipsis;
  ${({ maxWidth }) =>
    maxWidth
      ? css`
          max-width: ${maxWidth}%;
        `
      : ''};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
`
