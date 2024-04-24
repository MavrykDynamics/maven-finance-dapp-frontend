import styled, { css } from 'styled-components'
import { MavenTheme } from 'styles/interfaces'
import { ImpactValueType, NEGATIVE_IMPACT, POSITIVE_IMPACT } from './Impact.conts'

export const ImpactStyled = styled.div<{ theme: MavenTheme; $impact: ImpactValueType }>`
  height: 18px;
  padding: 3px;
  border-radius: 5px;
  font-weight: 400;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ $impact }) =>
    $impact === NEGATIVE_IMPACT
      ? css`
          color: ${({ theme }) => theme.downColor};
          background: ${({ theme }) => theme.downBgColor};
        `
      : $impact === POSITIVE_IMPACT
      ? css`
          color: ${({ theme }) => theme.upColor};
          background: ${({ theme }) => theme.upBgColor};
        `
      : css`
          color: ${({ theme }) => theme.primaryText};
          background: ${({ theme }) => theme.neutralBgColor};
        `}
`
