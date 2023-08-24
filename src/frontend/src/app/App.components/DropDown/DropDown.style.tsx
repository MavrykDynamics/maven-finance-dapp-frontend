import styled, { css } from 'styled-components/macro'
import { Card } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const DropDownStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  min-width: 226px;
  margin: 0 auto;
  position: relative;
  font-weight: 500;
  font-size: 14px;
  line-height: 24px;
  color: ${({ theme }) => theme.placeholders};
  background: ${({ theme }) => theme.backgroundColor};

  &.disabled {
    cursor: not-allowed;
    opacity: 0.6;

    div {
      pointer-events: none;
    }
  }

  &.cycle-dropdown {
    ul {
      max-height: 250px;
      overflow-y: auto;
    }
  }

  &.change-bakery {
    margin: 50px 0 30px 0;
  }

  &.input-dropdown {
    min-width: unset;
    div {
      border: none;

      span {
        border: none;
      }
    }

    &.not-capitalized {
      div {
        text-transform: initial;
      }
    }

    #selected-option {
      padding-left: 3px;
    }

    #dropDownListContainer {
      width: max-content;
      right: -8px;
      top: 85%;

      > div {
        background: ${({ theme }) => theme.cards};
        z-index: 10;
      }

      li {
        padding-left: 10px;
      }
    }

    span {
      border: none;
      margin: 0;
    }
  }

  &.select-xtz-baker {
    ul {
      overflow: auto;
      max-height: 400px;
    }
  }

  &.stage-3-dropDown {
    background: ${({ theme }) => theme.cards};

    > div {
      border: unset;
    }

    svg {
      stroke: ${({ theme }) => theme.linksAndButtons};
    }

    #selected-option {
      div {
        color: ${({ theme }) => theme.primaryText};
      }
    }

    #dropDownListContainer {
      div {
        color: ${({ theme }) => theme.primaryText};
      }
    }
  }
`

export const DropDownMenu = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding-left: 16px;
  border-width: 1.5px;
  border-style: solid;
  border-color: ${({ theme }) => theme.strokeForForms};
  color: ${({ theme }) => theme.placeholders};
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  cursor: pointer;
  text-transform: capitalize;

  > span {
    width: 50px;
    border-left: 1px solid ${({ theme }) => theme.strokeColor};
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    margin-left: 3px;

    > svg {
      height: 12px;
      width: 16px;
      stroke: ${({ theme }) => theme.strokeColor};
      stroke-width: 3px;
      fill: none;
      transition: 0.15s ease-in-out;

      &.open {
        transform: rotate(-180deg);
      }
    }
  }
`

export const DropDownListContainer = styled.div`
  position: absolute;
  width: 100%;
  top: 36px;
  right: 0;
  z-index: 11;
`

export const DropDownList = styled.ul<{ theme: MavrykTheme }>`
  display: block;
  position: relative;
  height: min-content;
  padding: 8px;
  border-radius: 10px;
  transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  will-change: border-color, box-shadow;
  border: 1px solid ${({ theme }) => theme.strokeForForms};
  background-color: ${({ theme }) => theme.cards};
  margin-top: 8px;
  z-index: 2;
`

export const DropDownListItem = styled.li<{ disabled?: boolean }>`
  list-style: none;
  height: 33px;
  display: flex;
  column-gap: 10px;
  align-items: center;
  width: 100%;
  color: ${({ theme }) => theme.placeholders};
  padding-left: 15px;
  padding-right: 15px;
  cursor: pointer;
  justify-content: space-between;

  .selectedIcon {
    stroke: ${({ theme }) => theme.upColor};
    width: 10px;
    height: 10px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.selectedColor}33;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          opacity: 0.6;
          cursor: not-allowed;

          > div {
            pointer-events: none;
          }
        `
      : ''}

  .truncated-text {
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

export const DropdownContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  > h4 {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.regularText};
    flex-shrink: 0;
    margin-right: 16px;
  }
`

export const DropdownCard = styled(Card)`
  padding: 0;
  margin: 0;

  .header {
    min-width: 270px;
    word-wrap: nowrap;
    display: flex;
    align-items: center;
    margin-right: 50px;
  }

  &.pending-dropdown {
    margin-bottom: 30px;
    margin-top: 30px;
  }

  &.satellite-governance-dropdown {
    margin-top: 30px;
  }
`

export const DropDownTruncatedChild = styled.div`
  max-width: 90%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

export const DropDownJsxChild = styled.div`
  width: 95%;
  align-items: center;
  display: flex;
  justify-content: space-between;

  .flex-row {
    display: flex;
    align-items: center;
    column-gap: 10px;
    font-weight: 500;
    font-size: 16px;
    color: ${({ theme }) => theme.regularText};

    &.with-image {
      svg,
      .img-wrapper {
        width: 24px;
        height: 24px;
        fill: ${({ theme }) => theme.regularText};

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .baker-fee {
    font-weight: 600;
    font-size: 14px;
    line-height: 21px;
    color: ${({ theme }) => theme.primaryText};
  }
`
