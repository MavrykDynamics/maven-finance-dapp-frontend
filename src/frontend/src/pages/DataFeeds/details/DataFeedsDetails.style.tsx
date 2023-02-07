import styled from 'styled-components'
import { boxShadowColor, cyanColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const DataFeedsStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;

  .info-icon {
    width: 12px;
    height: 12px;

    svg {
      width: 12px;
      height: 12px;
    }
  }

  .top-section-wrapper {
    display: flex;
    justify-content: space-between;
    height: 225px;
    .left-part {
      max-width: 745px;
      height: 100%;
      width: 100%;
      background: ${({ theme }) => theme.containerColor};
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      border-radius: 10px;

      .top {
        padding: 30px 40px;
        display: flex;
        justify-content: space-between;
        position: relative;

        .name-part {
          padding-left: 55px;
          position: relative;
          display: flex;
          align-items: center;

          .text {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          a {
            font-weight: 600;
            font-size: 12px;
            line-height: 18px;
            color: ${({ theme }) => theme.textColor};
            display: flex;
            align-items: center;

            .info-icon {
              svg {
                fill: ${({ theme }) => theme.textColor};
              }
            }
          }

          .img-wrapper,
          svg {
            position: absolute;
            height: 90%;
            max-width: 45px;
            left: 0;
            font-size: 14px;
            fill: ${({ theme }) => theme.textColor};

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }

        .price-part {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
        }

        &::before {
          position: absolute;
          content: '';
          bottom: 0;
          left: 0;
          height: 1px;
          background-color: ${({ theme }) => theme.cardBorderColor};
          width: 100%;
        }
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        column-gap: 5px;
        padding: 5px 40px 30px;
      }
    }

    .right-part {
      max-width: 315px;
      height: 100%;
      width: 100%;
      padding: 30px 17px;
      display: flex;
      align-items: center;
      flex-direction: column;
      background: ${({ theme }) => theme.containerColor};
      border: 1px solid ${({ theme }) => theme.cardBorderColor};
      border-radius: 10px;

      .register-pair-wrapper {
        max-width: 255px;
        width: 100%;
        margin-top: 25px;
      }

      h3 {
        font-weight: 600;
        font-size: 18px;
        color: ${({ theme }) => theme.textColor};
        margin-bottom: 20px;
      }

      .info-wrapper {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        margin: 5px 0;
      }
    }
  }

  .chart-wrapper {
    margin-top: 30px;
    min-height: 400px;
  }
`

export const DataFeedInfoBlock = styled.div<{ justifyContent?: string; theme: MavrykTheme }>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 15px;
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  min-height: 56px;
`

export const DataFeedsTitle = styled.div<{ fontWeidth?: number; fontSize?: number; theme: MavrykTheme }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  color: ${({ theme }) => theme.textColor};
  display: flex;
  align-items: center;

  padding: 2px 0 3px 0;

  &.title {
    margin: 0 auto;
    margin-bottom: 45px;
  }

  .info-icon {
    svg {
      fill: ${({ theme }) => theme.textColor};
    }
  }

  &.link {
    transition: 0.25s all;
    cursor: pointer;
    &:hover {
      color: ${cyanColor};
    }
  }
`

export const DataFeedSubTitleText = styled.div<{ fontWeidth?: number; fontSize?: number; theme: MavrykTheme }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  color: ${({ theme }) => theme.textColor};
  padding: 3px 0 4px 0;
  display: flex;
  align-items: center;

  &.title {
    margin: 0 auto;
    margin-bottom: 20px;
  }

  .info-icon {
    svg {
      fill: ${({ theme }) => theme.textColor};
    }
  }

  &.descr {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export const DataFeedValueText = styled.div<{ fontWeidth?: number; fontSize?: number; theme: MavrykTheme }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  color: ${({ theme }) => theme.dataColor};
  display: flex;

  p {
    margin: 0;
  }

  .timer {
    * {
      line-height: 100%;
    }
  }

  &.shield {
    svg {
      margin-right: 7px;
    }
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

export const UsersListWrapper = styled.div<{ theme: MavrykTheme }>`
  margin-top: 30px;

  .see-all-link {
    right: 45px !important;
  }
`

export const UsersListCardsWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  column-gap: 20px;
  margin-top: 30px;
  overflow: hidden;
`

export const UserSmallCard = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.containerColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;
  padding: 20px 35px;
  transition: 0.6s all;

  .img-wrapper {
    width: 40px;
    height: 40px;
    border: 1px solid ${({ theme }) => theme.headerColor};
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    border-color: ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
    cursor: pointer;
  }
`
