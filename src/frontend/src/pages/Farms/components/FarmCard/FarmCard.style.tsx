import styled from 'styled-components/macro'
import { CardHover } from 'styles'
import { MavenTheme } from '../../../../styles/interfaces'

export const FarmCardCommonStyles = styled(CardHover)<{ theme: MavenTheme }>`
  padding: 0;
  margin: 0;
  position: relative;

  .double-rewards-tag {
    width: fit-content;
    height: 30px;
    padding: 0 11px;
    column-gap: 5px;

    display: flex;
    align-items: center;

    background-color: ${({ theme }) => theme.coralColor};
    color: ${({ theme }) => theme.backgroundColor};
    white-space: nowrap;

    svg {
      width: 20px;
      height: 20px;

      fill: ${({ theme }) => theme.backgroundColor};
    }
  }

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

  .links {
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

  &.isCardOpened {
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
    box-shadow: 0px 4px 4px ${({ theme }) => theme.cardHoverColor};
  }
`

export const HorizontalFarmCardStyled = styled(FarmCardCommonStyles)<{ theme: MavenTheme }>`
  border: none;

  .expand-header {
    display: grid;
    align-items: center;

    grid-template-rows: auto;
    grid-template-columns: 320px 20px auto auto auto max-content max-content;

    column-gap: 30px;
    padding: 0 30px;
  }

  .double-rewards-tag {
    border-radius: 4px;

    &.isTransparent {
      opacity: 0;
    }
  }

  .farm-card-header {
    height: 48px;
    align-items: center;
    padding: 0;

    .logo {
      width: 48px;
      height: 48px;
    }

    .info {
      width: calc(100% - 48px - 15px);

      .name {
        font-size: 18px;
        line-height: 24px;
      }
    }
  }

  .column {
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &.apy {
      .value {
        align-items: flex-end;
      }
    }
  }

  .expand-child {
    padding: 20px;
    display: flex;
    align-items: center;

    > div {
      margin: 0;
    }

    .farm-harvest {
      width: 300px;
      height: 87px;
      margin-right: 20px;
    }

    .farm-actions {
      width: 550px;
      height: 87px;
      column-gap: 10px;
      align-items: center;

      .farmActionWrapper {
        width: 160px;
      }

      .info {
        margin-right: auto;
      }

      .start-farming {
        column-gap: 20px;
        justify-content: space-between;
      }
    }

    .links {
      margin-left: auto;
    }
  }
`

export const VerticalFarmCardStyled = styled(FarmCardCommonStyles)<{ theme: MavenTheme }>`
  padding: 43px 20px 0 20px;

  .double-rewards-tag {
    position: absolute;
    top: 10px;
    left: 0px;

    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }

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

    .name {
      text-align: right;
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
    min-height: 205px;

    margin: 15px 0 0 0;
    row-gap: 10px;

    flex-direction: column;

    .farmActionWrapper {
      width: 100%;
    }

    .start-farming {
      row-gap: 20px;

      flex-direction: column;
      justify-content: center;
    }
  }

  .vertical-expand {
    position: relative;
    margin-top: 15px;
    padding: 13px 0;
    border: none;

    > header {
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

    .links {
      padding-top: 15px;
    }
  }
`
