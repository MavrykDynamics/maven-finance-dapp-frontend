import styled from 'styled-components/macro'
import { MavenTheme } from '../../../../styles/interfaces'

export const RoiCalculatorStyled = styled.section<{ theme: MavenTheme }>`
  padding: 40px 40px;
  padding-bottom: 30px;

  header {
    display: flex;
    align-items: center;
    margin-bottom: 21px;

    h2 {
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      padding-left: 18px;
    }
  }

  #input-roi {
    height: 60px;
    padding-bottom: 30px;
  }

  .fieldset-roi {
    margin-bottom: 29px;

    .pinned-text {
      top: 13px;
    }
  }

  .label-roi {
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: ${({ theme }) => theme.regularText};
    padding-left: 8px;
    padding-bottom: 2px;
  }

  .exchange-roi {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: ${({ theme }) => theme.placeholders};
    padding: 0 20px;
    margin-top: -24px;
    position: relative;

    & span:last-of-type {
      color: ${({ theme }) => theme.subHeadingText};
    }
  }

  .current-rates {
    background: ${({ theme }) => theme.roiCalculatorBackground};
    border-radius: 10px;
    margin-top: 40px;
    padding: 20px 30px;
    color: ${({ theme }) => theme.regularText};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;

      color: ${({ theme }) => theme.regularText};
    }

    p {
      margin: 0;
      font-weight: 400;
      margin-top: 35кpx;
      display: flex;
      column-gap: 10px;
    }

    button {
      svg {
        width: 24px;
        height: 24px;
        stroke: ${({ theme }) => theme.linksAndButtons};
      }

      &.active {
        svg {
          opacity: 0.8;
        }
      }
    }

    .input-wrapper {
      position: relative;

      .farm-modal-backward-input {
        #input-roi-backward {
          height: 60px;
          width: 200px;
          padding: 5px 0px 25px 10px;
        }

        .pinned-text {
          font-size: 16px;
          top: 12px;
        }

        .with-text {
          right: 55px;
        }
      }

      .exchange-roi-backward {
        width: 200px;
        position: absolute;
        bottom: 5px;
        left: 10px;

        span {
          display: flex;
          column-gap: 10px;

          div {
            p {
              font-weight: 600;
              font-size: 12px;
              line-height: 18px;
              color: ${({ theme }) => theme.placeholders};
            }
          }
        }
      }
    }
  }

  .tab-block {
    margin-bottom: 30px;

    h4 {
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
      padding-left: 4px;
      margin-bottom: 12px;
    }

    .tab-component {
      display: grid;

      button {
        width: auto;
        padding-left: 18px;
        padding-right: 18px;
      }

      &.values-tabs {
        grid-template-columns: repeat(3, 1fr);
      }
      &.staked-tabs {
        grid-template-columns: repeat(5, 1fr);
      }
      &.compounding-tabs {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }

  .compounding-every {
    display: flex;
    align-items: center;

    .compounding-checkbox {
      display: flex;
      align-items: center;
      margin-right: 22px;
    }

    .compounding-tabs {
      width: 100%;
    }
  }
` // RoiCalculatorStyled

export const RoiExpandStyled = styled.div`
  .roi-expand {
    border-radius: 0;
    border: none;

    &:hover {
      box-shadow: none;
    }

    article {
      &::before {
        display: none;
      }

      &.show {
        padding-top: 11px;
      }
    }

    .roi-expand-ul {
      list-style: none;
      padding-bottom: 30px;
      padding-right: 30px;
      padding-left: 30px;
      margin: 0;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 17px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0;
          font-weight: 600;
          font-size: 14px;
        }

        var {
          font-weight: 600;
          font-size: 14px;
          color: ${({ theme }) => theme.primaryText};

          p {
            margin: 0;
          }
        }
      }
    }
  }
`
