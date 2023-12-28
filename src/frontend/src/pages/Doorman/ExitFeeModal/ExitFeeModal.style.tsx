import styled from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'

export const ExitFeeModalContent = styled.div<{ theme: MavenTheme }>`
  padding: 10px 40px 0 40px;

  label {
    color: ${({ theme }) => theme.mainHeadingText};
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    display: block;
    margin-left: 6px;
  }
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

    color: ${({ theme }) => theme.primaryText};
  }

  h4 {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;

    color: ${({ theme }) => theme.subHeadingText};

    display: flex;
    align-items: center;

    a {
      display: flex;
      margin-left: 5px;
    }
  }
`

export const ExitFeeModalButtons = styled.div`
  display: flex;
  margin-top: 30px;
  column-gap: 10px;
`
