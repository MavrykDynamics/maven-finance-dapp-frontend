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
    background-color: ${({ theme }) => theme.textColor};
    transform: translateX(-50%);
  }

  .title-status {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;

    .tooltip {
      position: absolute;
      right: 0px;
      top: -17px;
    }
  }

  .voting-ends {
    color: ${({ theme }) => theme.dataColor};
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    margin-bottom: 30px;
  }

  .proposal-button-action {
    margin-left: auto;
    width: fit-content;
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

    * {
      word-break: break-all;
    }
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

  // bytes styles
  .bytes-list {
    display: flex;
    flex-direction: column;
    padding: 0;
    padding-left: 7px;
    margin: 0;
    margin-top: 10px;
    row-gap: 15px;

    list-style: none;
    counter-reset: index;

    li {
      counter-increment: index;
      position: relative;
      display: flex;
      flex-direction: column;
      row-gap: 7px;

      .title {
        color: ${({ theme }) => theme.textColor};
        font-size: 16px;
        white-space: nowrap;
      }

      .byte {
        display: flex;

        &.opened {
          flex-direction: column;
          row-gap: 5px;

          .byte-text {
            max-width: 100%;
            overflow: visible;
            word-break: break-all;

            &:hover {
              opacity: 0.8;
              cursor: pointer;
            }
          }
        }

        .byte-content {
          display: flex;
        }

        .byte-text {
          max-width: 335px;
          text-overflow: ellipsis;
          overflow: hidden;
          font-size: 16px;
          font-weight: 400;
          color: ${({ theme }) => theme.dataColor};
          transition: 0.5s opacity;

          svg {
            width: 16px;
            height: 16px;
            vertical-align: sub;
            margin-left: 4px;
            stroke: ${cyanColor};
          }
        }
      }
    }

    li:before {
      position: absolute;
      top: 3px;
      left: 0px;
      content: counter(index) '. ';
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
      font-weight: 400;
    }
  }
`
