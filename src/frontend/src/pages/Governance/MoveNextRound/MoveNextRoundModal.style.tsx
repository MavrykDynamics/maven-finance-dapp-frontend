import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const MoveNextRoundModalstyle = styled.div<{ theme: MavrykTheme }>`
  p {
    font-weight: 600;
    font-size: 18px;
    line-height: 27px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
    margin-top: 10px;
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
      color: ${({ theme }) => theme.dataColor};
    }

    .value {
      font-weight: 600;
      font-size: 16px;

      p {
        color: ${({ theme }) => theme.valueColor};
      }
    }
  }

  .btn-group {
    display: flex;
    justify-content: center;
    margin-bottom: 27px;
    margin-top: 20px;

    button {
      margin: 0 5px;
      width: 220px;
    }
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
