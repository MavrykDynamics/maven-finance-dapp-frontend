import styled from 'styled-components/macro'
import { Card, CardHover } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const FarmCardStyled = styled(Card)<{ theme: MavrykTheme }>`
  margin: 0;
  padding: 0;

  .farm-info {
    h3 {
      font-weight: 600;
      font-size: 14px;
      line-height: 21px;
      color: ${({ theme }) => theme.subHeadingText};
    }

    var,
    .value {
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      color: ${({ theme }) => theme.primaryText};
      font-style: normal;

      p {
        margin: 0;
      }
    }
  }

  .farm-card-section {
    margin-left: 16px;
    padding-top: 12px;
    padding-bottom: 12px;

    h3 {
      font-weight: 600;
      font-size: 22px;
      line-height: 22px;
      max-width: 200px;

      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* p {
      font-weight: 400;
      font-size: 11px;
      line-height: 11px;
      color: ${({ theme }) => theme.regularText};
      margin: 3px 0;
    } */

    .subtitle {
      margin-top: 3px;
      font-weight: 400;
      font-size: 11px;
      text-align: right;
      color: ${({ theme }) => theme.primaryText};
    }
  }

  .farm-card-header {
    display: flex;
    align-items: center;
    margin-right: 32px;
  }

  .links-block {
    a {
      display: flex;
      align-items: center;
      color: ${({ theme }) => theme.linksAndButtons};
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      margin-top: 8px;
      margin-bottom: 10px;

      svg {
        fill: none;
        stroke: ${({ theme }) => theme.linksAndButtons};
        width: 16px;
        height: 16px;
        margin-left: 8px;
      }
    }
  }

  &.horizontal {
    position: relative;
    border: none;
    align-items: baseline;

    .expand-header {
      grid-template-columns: 300px 1fr 1fr 1fr 1fr 100px;
      padding-left: 40px;
    }

    .farm-info {
      .btn-info {
        position: relative;
        width: fit-content;
        .calc-button {
          position: absolute;
          right: -23px;
          margin: 0;
        }
      }
    }

    .farm-card-section {
      p {
        display: none;
      }
    }

    .farm-card-header {
      figure {
        right: 12px;
        flex-shrink: 0;
      }
    }

    .horizontal-expand {
      .farm-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  } //horizontal

  &.vertical {
    position: relative;
    .farm-info-vertical {
      padding-left: 40px;
      padding-right: 40px;
      margin-bottom: 31px;

      .farm-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .farm-card-header {
      margin: 0;
      display: flex;
      justify-content: space-between;
      text-align: right;
      padding-left: 40px;
      padding-right: 40px;
      padding-top: 40px;
      margin-bottom: 25px;
    }

    .expand-header {
      grid-template-columns: 1fr;
      border-top: 1px solid ${({ theme }) => theme.divider};
      min-height: 47px;
    }

    .vertical-expand {
      border: none;

      .farm-info-vertical {
        margin-top: 7px;
        margin-bottom: 19px;
      }

      .links-block {
        padding-left: 40px;
        margin-bottom: 40px;
      }

      article::before {
        display: none;
      }
    }

    .vertical-harvest {
      padding: 20px;
      padding-top: 0;

      .farm-harves {
        padding: 20px;
      }

      .start-farming {
        padding: 70px 20px 56px 20px;
        flex-direction: column;
        row-gap: 27px;
        align-items: center;
        margin-bottom: 10px;
        border: 1px solid ${({ theme }) => theme.divider};
        border-radius: 10px;

        h3 {
          margin-bottom: 13px;
          margin-top: 3px;

          font-weight: 600;
          font-size: 22px;
          line-height: 22px;
        }

        div:not(.isConnected) {
          margin: 0;
          width: 100%;
          max-width: 100%;
        }

        button {
          margin: 0;
          width: 100%;
        }
      }
    }
  } //vertical

  .btn-info {
    display: flex;
    align-items: center;

    button {
      margin-left: 8px;
    }
  }

  .horizontal-expand {
    display: grid;
    align-items: center;
    grid-template-columns: auto auto 170px;
    padding: 20px;
    margin: 0;
    gap: 20px;

    .farm-stake {
      flex-direction: row;
      padding: 20px;

      .circle-buttons {
        flex-direction: row;
        padding-top: 0;
        flex: 1;
      }
    }

    .farm-harvest {
      padding: 20px;
    }
  }

  .start-farming {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-left: 40px;
    border: 1px solid ${({ theme }) => theme.divider};
    border-radius: 10px;
    height: 100%;

    div {
      margin: 0;
      width: fit-content;
    }

    h3 {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      margin-right: 10px;
    }
  }

  .calc-button {
    svg {
      width: 19px;
      height: 19px;
      fill: ${({ theme }) => theme.linksAndButtons};
      transition: 0.3s fill;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &.opened {
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
    box-shadow: 0px 4px 4px ${({ theme }) => theme.cardHoverColor};
  }

  &.opened {
    .prevent-hover {
      &:hover {
        border-color: transparent;
        box-shadow: unset;
      }
    }
  }
` // CARD

export const FarmHarvestStyled = styled(Card)`
  display: flex;
  align-items: center;
  padding: 18px 30px;
  margin: 0;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.divider};

  .farm-info {
    flex-shrink: 0;
    margin-right: 20px;
  }
`

export const FarmStakeStyled = styled(Card)`
  display: flex;
  padding: 18px 30px;
  margin: 0;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.divider};

  .farm-info {
    flex-shrink: 0;
    margin-right: 20px;
  }

  .circle-buttons {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    flex-direction: column;
    padding-top: 24px;
  }
`

export const FarmCardCommonStyles = styled(CardHover)<{ theme: MavrykTheme }>`
  position: relative;

  .name {
    font-size: 14px;
    font-weight: 600;

    color: ${({ theme }) => theme.regularText};
  }

  .value {
    display: flex;
    align-items: center;

    column-gap: 6px;

    font-size: 16px;
    font-weight: 600;

    color: ${({ theme }) => theme.primaryText};

    p {
      margin: 0;
    }
  }

  &.isCardOpened {
    border-color: ${({ theme }) => theme.linksAndButtons};
    box-shadow: 0px 4px 4px ${({ theme }) => theme.cardHoverColor};
  }
`

export const HorizontalFarmCardStyled = styled(FarmCardCommonStyles)<{ theme: MavrykTheme }>``

export const VerticalFarmCardStyled = styled(FarmCardCommonStyles)<{ theme: MavrykTheme }>`
  padding: 40px 20px 0 20px;

  .farm-card-header {
    width: 100%;
    height: 58px;

    .logo {
      width: 58px;
      height: 58px;
    }

    .info {
      width: calc(100% - 58px - 15px);
    }
  }

  .farm-stats {
    display: flex;
    flex-direction: column;

    margin-top: 20px;
    padding: 0 20px;
    row-gap: 5px;

    .row {
      width: 100%;
      height: 20px;

      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .value {
      svg {
        height: 20px;
        width: 20px;
      }
    }
  }

  .farm-actions {
    width: 100%;

    margin: 15px 0 0 0;
    row-gap: 10px;

    display: flex;
    flex-direction: column;

    .farmActionWrapper {
      width: 100%;
    }

    .start-farming {
      height: 100%;
      row-gap: 20px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      h3 {
        color: ${({ theme }) => theme.regularText};
        font-size: 22px;
        font-weight: 600;
      }
    }
  }

  .vertical-expand {
    position: relative;

    margin-top: 15px;
    padding: 13px 0;

    > header {
      height: fit-content;
      min-height: unset;
      grid-template-columns: 1fr;
    }

    > article::before {
      display: none;
    }

    &:hover {
      box-shadow: unset;
    }

    &::before {
      content: '';
      position: absolute;
      width: calc(100% + 40px);
      height: 1px;
      background-color: ${({ theme }) => theme.divider};
      top: 0%;
      left: 50%;
      transform: translateX(-50%);
    }

    border: none;

    .expand-data {
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      row-gap: 10px;

      a {
        display: flex;
        align-items: center;
        column-gap: 6px;
        font-size: 14px;

        svg {
          height: 16px;
          width: 16px;
          fill: ${({ theme }) => theme.linksAndButtons};
        }
      }
    }
  }
`

export const FarmCardHeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  column-gap: 15px;
  padding: 0 20px;

  .info {
    display: flex;
    flex-direction: column;
    row-gap: 3px;
    align-items: flex-end;

    .name {
      width: 100%;
      font-size: 22px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      text-align: right;
    }

    .creator {
      font-size: 14px;
      font-weight: 400;
    }
  }
`

export const FarmCardHarvestStyled = styled(Card)`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 1fr;

  column-gap: 4px;
  padding: 20px;
  margin: 15px 0 0 0;

  border: 1px solid ${({ theme }) => theme.divider};

  .info {
    display: flex;
    flex-direction: column;
  }
`

export const FarmCardActionsStyled = styled(Card)`
  padding: 20px;
`
