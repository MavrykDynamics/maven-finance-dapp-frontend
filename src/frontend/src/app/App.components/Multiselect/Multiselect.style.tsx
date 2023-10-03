import styled from 'styled-components'
import { ThemeColorsType } from 'styles'
import { MavrykTheme } from 'styles/interfaces'
import { ControlProps, GroupBase } from 'react-select'
import Icon from '../Icon/Icon.view'
import { MultiselectItemType } from './Multiselect.types'

export const MultiselectStyled = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  position: relative;
`

export const MultiselectOptionsControlStyled = styled.div<{ theme: MavrykTheme }>`
  position: relative;
  cursor: pointer;

  width: 100%;
  min-height: 35px;
  padding: 16px;
  column-gap: 10px;

  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.backgroundColor};
  border: 1px solid ${({ theme }) => theme.strokeColor};

  border-bottom: none;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;

  &:before {
    content: '';
    background-color: ${({ theme }) => theme.divider};
    position: absolute;
    height: 1px;
    width: calc(100% - 16px);
    left: 50%;
    transform: translateX(-50%);
    bottom: 8px;
  }

  input {
    background-color: transparent;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    border: none;
    outline: none;

    &::placeholder {
      color: ${({ theme }) => theme.placeholders};
    }
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: ${({ theme }) => theme.strokeForForms};
  }
`

export const CustomControlComponent = <ItemType extends MultiselectItemType>({
  selectProps,
}: ControlProps<ItemType, true, GroupBase<ItemType>>) => {
  console.log({ selectProps })
  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    selectProps.onInputChange(value, {
      action: 'input-change',
      prevInputValue: selectProps.inputValue,
    })
  }
  return (
    <MultiselectOptionsControlStyled>
      <Icon id="search" />
      <input type="search" placeholder="Search option" value={selectProps.inputValue} onChange={inputOnChange} />
    </MultiselectOptionsControlStyled>
  )
}

export const MultiselectOptionStyled = styled.div<{ theme: ThemeColorsType }>`
  cursor: pointer;
  width: 100%;
  column-gap: 10px;
  padding: 6px 16px 6px 8px;

  display: flex;
  align-items: center;

  .option-text {
    transition: 0.3s color;

    font-size: 14px;
    font-weight: 500;
    text-transform: capitalize;

    color: ${({ theme }) => theme.placeholders};
  }

  &:hover {
    .option-text {
      color: ${({ theme }) => theme.linksAndButtons};
    }
  }
`

export const MultiselectOptionTagStyled = styled.div<{ theme: ThemeColorsType }>`
  display: flex;
  align-items: center;

  background-color: ${({ theme }) => theme.selectedColor};

  padding: 0 10px;
  column-gap: 10px;
  border-radius: 8px;

  cursor: pointer;
  transition: 0.3s background-color;

  &:hover {
    background-color: ${({ theme }) => theme.downBgColor};

    .unselect-option > svg {
      fill: ${({ theme }) => theme.downColor};
    }

    .option-text {
      color: ${({ theme }) => theme.downColor};
    }
  }

  .option-text {
    transition: 0.3s color;

    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 24px;
    text-transform: capitalize;

    color: ${({ theme }) => theme.backgroundColor};
  }

  .unselect-option {
    display: flex;
    align-items: center;

    svg {
      fill: ${({ theme }) => theme.backgroundColor};
      transition: 0.3s fill;
      width: 12px;
      height: 12px;
    }
  }
`

export const MultiselectHeaderStyled = styled.div<{ theme: ThemeColorsType }>`
  display: flex;
  align-items: center;

  padding: 8px 16px;
  min-height: 35px;

  background-color: ${({ theme }) => theme.backgroundColor};
  border: 1px solid ${({ theme }) => theme.strokeColor};
  border-radius: 10px;

  cursor: pointer;
  position: relative;
  z-index: 4;

  &:before {
    content: '';
    height: 100%;
    min-height: 35px;
    width: 1px;
    background-color: ${({ theme }) => theme.divider};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 46px;
  }

  &:hover {
    border: 1px solid ${({ theme }) => theme.linksAndButtons};
  }

  .selected-options-list {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .placeholder {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.placeholders};
  }

  .controls {
    margin-left: auto;
    height: 100%;
    align-items: center;
    display: flex;

    .open-status {
      display: flex;
      align-items: center;

      padding-left: 12px;
      margin-left: 10px;

      svg {
        transition: 0.3s rotate;
        width: 18px;
        height: 17px;
      }

      &.isOpen {
        svg {
          rotate: 180deg;
        }
      }
    }

    .clear-all {
      display: flex;
      align-items: center;

      svg {
        transition: 0.3s fill;
        width: 12px;
        height: 12px;
      }

      &:hover {
        svg {
          fill: ${({ theme }) => theme.linksAndButtons};
        }
      }
    }

    svg {
      fill: ${({ theme }) => theme.strokeForForms};
    }
  }
`

export const MultiselectMenuStyled = styled.div<{ theme: ThemeColorsType }>`
  .space {
    width: 100%;
    height: 5px;
  }

  width: 100%;

  position: absolute;
  top: 100%;
  z-index: 2;
`

export const MultiselectBackdropStyled = styled.div<{ theme: ThemeColorsType }>`
  position: fixed;
  z-index: 1;

  bottom: 0;
  left: 0;
  top: 0;
  right: 0;
`
