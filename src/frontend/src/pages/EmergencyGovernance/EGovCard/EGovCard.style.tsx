import styled from 'styled-components/macro'
import { MavenTheme } from '../../../styles/interfaces'
import { CardHover } from 'styles'

export const EGovActiveCardStyled = styled(CardHover)<{ theme: MavenTheme }>`
  width: 100%;
  border-radius: 10px;
  margin: 30px 0;
  padding: 30px;
  display: flex;
  flex-direction: column;

  .voting-ends {
    color: ${({ theme }) => theme.primaryText};
    display: flex;
    align-items: center;
    column-gap: 3px;
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
      color: ${({ theme }) => theme.regularText};
    }

    .eGov-voting {
      .voting-buttons-wrapper {
        padding-top: 7px;
      }

      button.votingFor {
        background: ${({ theme }) => theme.linksAndButtons};
        width: 50%;
      }
    }
  }
`

export const EGovPastCardTopColumnStyled = styled.div<{ theme: MavenTheme }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  row-gap: 5px;

  .name {
    font-weight: 600;
    font-size: 14px;
    color: ${({ theme }) => theme.subHeadingText};
  }

  .value {
    margin-bottom: 0;
    margin-top: 0;
    color: ${({ theme }) => theme.primaryText};
    font-weight: 600;
    font-size: 16px;

    &.proposal-name {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 90%;
    }
  }
`

export const EGovPastCardBodyStyled = styled.div<{ theme: MavenTheme }>`
  position: relative;
  width: 100%;
  padding: 30px;

  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;

  display: flex;
  justify-content: space-between;

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${({ theme }) => theme.divider};
    width: 100%;
    left: 0;
    top: 1px;
  }

  h3 {
    margin: 0;
    font-weight: 600;
    font-size: 18px;
    color: ${({ theme }) => theme.mainHeadingText};
  }

  article {
    align-self: center;
    width: 45%;
  }

  .text {
    width: 50%;
  }
`
