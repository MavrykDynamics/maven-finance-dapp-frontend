import styled from 'styled-components/macro'
import { Card, royalPurpleColor, containerColor, skyColor, cyanColor, headerColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SlidingTabButtonsWrap = styled.div`
  display: flex;
  width: 536px;
  margin-top: 30px;
  margin-bottom: 30px;

  > div {
    width: 100%;
    justify-content: flex-end;
  }

  button {
    width: 100%;
  }
`

export const SatelliteGovernanceStyled = styled.section<{ theme: MavrykTheme }>`
  .satellite-governance-article {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding-top: 30px;
    margin-bottom: 0;
  }

  .tab-buttons {
    margin-top: 30px;
    margin-bottom: 30px;
    width: 536px;
    justify-content: unset;

    button {
      width: 100%;
      height: 38px;
    }
  }

  .buttons-selector {
    margin: 30px 0 25px 0;
  }

  textarea {
    height: 84px;
  }

  .suspend-satellite-group {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    padding-top: 40px;
  }

  .satellite-governance-info {
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 10px;
    background-color: ${({ theme }) => theme.containerColor};
    padding: 25px 28px;
    display: flex;
    flex-direction: column;
    row-gap: 7px;

    h3 {
      font-weight: 600;
      font-size: 14px;
      color: ${({ theme }) => theme.textColor};
    }

    .info-content {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 16px;
      color: ${({ theme }) => theme.dataColor};
      position: relative;

      p {
        margin: 0;
      }

      a {
        width: 16px;
        height: 16px;
        margin-left: 4px;
      }
    }
  }
`

export const AvailableActionsStyle = styled.div`
  padding: 0;
  margin-top: 0;
  border-top: 1px solid ${royalPurpleColor};

  .satellite-address {
    margin-bottom: 19px;
  }

  .inputs-block {
    padding-top: 40px;
    padding-left: 26px;
    padding-right: 26px;
    padding-bottom: 23px;
    position: relative;

    button:not(.btn-add-row, .table-drop-btn-cur, .delete-button) {
      width: 260px;
      margin-left: 64px;
      margin-bottom: 16px;

      svg {
        stroke: transparent;
      }
    }

    .banSatellite,
    .removeOracles,
    .removeFromAggregator {
      &.fill {
        svg {
          stroke: ${containerColor};
        }
      }
    }

    h1 {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 10px;
    }

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${skyColor};
      margin-top: 1px;
      margin-bottom: 17px;
      margin-left: 10px;
    }

    label {
      font-weight: 700;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      padding-left: 8px;
      padding-left: 10px;
      margin-bottom: 5px;
      display: block;
    }

    fieldset {
      display: grid;
      grid-template-columns: 0.5fr 0.5fr;
      gap: 20px;
    }
  }

  .table-wrap {
    position: relative;
  }
` // AvailableActionsStyle
