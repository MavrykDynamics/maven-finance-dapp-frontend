import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const MoveNextRoundModalStyled = styled.div<{ theme: MavrykTheme }>`
  h1 {
    margin: 0 0 20px 0;
  }

  p {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
    margin-top: 0;
    margin-bottom: 20px;
  }

  .step-info {
    margin: 10px auto;
    width: 320px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      margin: 0;
    }

    .name {
      font-weight: 500;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;

      p {
        color: ${({ theme }) => theme.dataColor};
      }
    }
  }

  .btn-group {
    display: flex;
    margin-bottom: 10px;
    margin-top: 20px;
    column-gap: 10px;
  }
`

export const MoveNextRoundModalBase = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 20px;

  .descr {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    text-align: center;
    padding: 0 30px;
    color: ${({ theme }) => theme.textColor};
  }

  .calcs {
    padding: 0 100px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;

    .row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      p {
        margin: 0;
      }

      .name {
        font-weight: 500;
        font-size: 14px;
        color: ${({ theme }) => theme.dataColor};
      }

      .value {
        font-weight: 600;
        font-size: 16px;
        color: ${({ theme }) => theme.valueColor};
      }
    }
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    column-gap: 10px;
    margin-top: 10px;
  }
`
