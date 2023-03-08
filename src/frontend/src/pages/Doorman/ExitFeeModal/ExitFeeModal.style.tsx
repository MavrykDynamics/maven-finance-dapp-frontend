import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const ExitFeeModalContent = styled.div<{ theme: MavrykTheme }>`
  padding: 10px 40px 0 40px;

  label {
    color: ${({ theme }) => theme.textColor};
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    display: block;
    margin-left: 6px;
  }
`

export const InputPinnedText = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  padding: 0 16px;

  height: 100%;

  font-weight: 600;
  font-size: 20px;
  line-height: 20px;

  color: ${({ theme }) => theme.textColor};
`

export const ExitFeeModalStats = styled.div`
  margin: 10px 6px 0;

  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  p {
    margin: 0;

    font-weight: 600;
    font-size: 16px;
    line-height: 22px;

    color: ${({ theme }) => theme.dataColor};
  }

  h4 {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    color: ${({ theme }) => theme.textColor};

    svg {
      width: 12px;
      height: 12px;
      margin-left: 4px;

      fill: ${({ theme }) => theme.textColor};
    }
  }
`

export const ExitFeeModalButtons = styled.div`
  display: flex;
  margin-top: 30px;
  column-gap: 10px;
`

export const ExitFeeModalGrid = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  font-weight: 500;
  margin: auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
  }

  > p {
    color: ${({ theme }) => theme.primaryColor};
    margin-top: 0;
  }
`

export const ExitFeeModalFee = styled.div<{ theme: MavrykTheme }>`
  font-size: 24px;
  font-weight: bold;
  margin: 50px auto;
  text-align: center;

  > div {
    color: ${({ theme }) => theme.subTextColor};
  }

  > p {
    color: ${({ theme }) => theme.primaryColor};
  }
`
