import styled from 'styled-components'
import { Card, cyanColor, headerColor, royalPurpleColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const ProposalDetailsStyled = styled(Card)<{ isAuthorized?: boolean; theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  width: calc(50% - 30px);
  padding: 28px 30px;
  border-radius: 10px;
  flex-shrink: 0;
  margin: 0;
  position: relative;
  padding-bottom: 50px;

  &::after {
    position: absolute;
    content: '';
    width: 44px;
    height: 3px;
    border-radius: 10px;
    bottom: 22px;
    left: 50%;
    background-color: ${royalPurpleColor};
    transform: translateX(-50%);
  }

  .title-status {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .voting-ends {
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    margin-bottom: 40px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.cardBorderColor};
    margin: 30px 0;
  }

  .proposal-data-block-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 5px;
    margin-bottom: 30px;
  }

  .proposal-data-block-name {
    color: ${({ theme }) => theme.textColor};
    font-weight: 600;
    font-size: 18px;
  }

  .proposal-data-block-value {
    color: ${({ theme }) => theme.dataColor};
    font-weight: 500;
    font-size: 14px;
  }

  .drop-proposal {
    margin-left: auto;
    width: fit-content;
  }

  .gov-data {
    display: flex;
    justify-content: space-between;

    .proposal-data-block-name {
      font-weight: 500;
      font-size: 14px;
    }
  }

  /* OLD STYLES */
  .byte,
  .hide {
    svg {
      width: 16px;
      height: 16px;
      display: inline-block;
      vertical-align: sub;
      margin-left: 4px;
      stroke: ${cyanColor};
    }

    button {
      margin: 0;
      padding: 0;
      text-align: left;
      line-height: inherit;
      font-size: inherit;
    }
  }
`
