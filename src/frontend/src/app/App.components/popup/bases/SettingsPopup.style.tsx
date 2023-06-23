import styled from 'styled-components'
import { cyanColor, royalPurpleColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SettingsPopupBase = styled.div<{ theme: MavrykTheme }>`
  .title {
    font-weight: 700;
    font-size: 25px;
    line-height: 25px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
  }

  .change-node-descr {
    margin: 15px 0 15px 0;
    max-width: 620px;
    padding: 0 10px;
    color: ${({ theme }) => theme.textColor};
    text-align: center;
    font-size: 14px;
    line-height: 21px;
  }

  .error-msg {
    max-width: 620px;
    padding: 0 10px;
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    margin: 15px 0 -5px 0;
    text-align: center;
    color: ${({ theme }) => theme.downColor};
  }

  .theme-switcher-block {
    margin-top: 30px;
  }

  .buttons-wrapper {
    display: flex;
    column-gap: 7px;
    margin-top: 10px;
  }
`

export const ChangeNodeNodesList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 18px;
  padding-right: 10px;
`

export const ChangeNodeNodesListItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;

  font-weight: 600;
  font-size: 18px;
  line-height: 18px;

  color: ${({ theme }) => theme.textColor};
  border-radius: 10px;
  border: ${({ isSelected }) => (isSelected ? `1px solid ${cyanColor}` : `1px solid ${royalPurpleColor};`)};

  position: relative;
  height: 75px;
  padding: 20px;
  margin-top: 10px;

  cursor: pointer;

  .img-wrapper {
    height: 35px;
    width: 35px;
    margin-right: 18px;
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    color: ${({ theme }) => theme.textColor};
    font-size: 18px;
    line-height: 18px;

    &.user-node {
      font-size: 16px;
      line-height: 16px;
    }
  }

  &.add_node {
    justify-content: space-between;
    cursor: default;

    .add-new-node-title {
      width: 100%;
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      color: ${({ theme }) => theme.textColor};
      white-space: nowrap;
      margin-right: 10px;
      pointer-events: none;
    }

    input {
      padding-left: 7px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    &.expanded {
      .add-new-node-title {
        display: none;
      }
    }
  }

  .remove-node {
    position: absolute;
    right: -25px;
    top: 50%;
    transform: translateY(-50%);

    // overwriting styles from button((
    svg {
      width: 14px;
      height: 14px;
    }
  }
`
