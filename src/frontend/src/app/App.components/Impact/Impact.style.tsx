import styled, { css } from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'
import { ImpactValueType, NEGATIVE_IMPACT, POSITIVE_IMPACT } from './Impact.conts'

export const ImpactStyled = styled.div<{ theme: MavrykTheme; impact: ImpactValueType }>`
  height: 18px;
  padding: 3px;
  border-radius: 5px;
  font-weight: 400;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ impact }) =>
    impact === NEGATIVE_IMPACT
      ? css`
          color: ${({ theme }) => theme.downColor};
          background: rgba(255, 67, 67, 0.2);
        `
      : impact === POSITIVE_IMPACT
      ? css`
          color: ${({ theme }) => theme.upColor};
          background: rgba(52, 246, 106, 0.2);
        `
      : css`
          color: ${({ theme }) => theme.dataColor};
          background: rgba(119, 164, 242, 0.2);
        `}
`
