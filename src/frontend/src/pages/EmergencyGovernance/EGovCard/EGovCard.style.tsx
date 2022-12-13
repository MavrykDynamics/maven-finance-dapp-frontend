import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const EGovActiveCardStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  background: ${({ theme }) => theme.containerColor};
  margin: 30px 0;
  padding: 30px;
  display: flex;
  flex-direction: column;

  .voting-ends {
    color: ${({ theme }) => theme.dataColor};
    margin: 10px 0 20px 0;
    font-weight: 600;
    font-size: 14px;
  }

  .main-info {
    display: flex;
    justify-content: space-between;

    > * {
      width: 48%;
    }

    article {
      height: fit-content;
    }

    .left {
      display: flex;
      flex-direction: column;
      row-gap: 20px;
      min-height: 100%;
      justify-content: space-between;

      button {
        max-width: 200px;
      }
    }

    .descr {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: ${({ theme }) => theme.textColor};
    }
  }
`
