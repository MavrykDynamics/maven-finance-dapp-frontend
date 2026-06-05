import styled from 'styled-components'
import { FontSize, FontWeight } from 'styles/typography'
import { MavenTheme } from 'styles/interfaces'

export const SettingsPopupBase = styled.div<{ theme: MavenTheme }>`
  .title {
    font-weight: ${FontWeight.bold};
    font-size: 25px;
    line-height: 25px;
    color: ${({ theme }) => theme.mainHeadingText};
    text-align: center;
  }

  .change-node-descr {
    margin: 15px 0 15px 0;
    max-width: 620px;
    padding: 0 10px;
    color: ${({ theme }) => theme.mainHeadingText};
    text-align: center;
    font-size: ${FontSize.base};
    line-height: 21px;
  }

  .error-msg {
    max-width: 620px;
    padding: 0 10px;
    font-weight: ${FontWeight.bold};
    font-size: ${FontSize.base};
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

    & button {
      border-width: 2px;
      text-transform: capitalize;
    }
  }
`

export const ChangeNodeNodesList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 18px;
  padding-right: 10px;
`

export const ChangeNodeNodesListItem = styled.div<{ $isSelected?: boolean; theme: MavenTheme }>`
  display: flex;
  align-items: center;

  font-weight: ${FontWeight.semibold};
  font-size: ${FontSize.lg};
  line-height: 18px;

  border-radius: 10px;
  border: ${({ $isSelected, theme }) =>
    $isSelected ? `2px solid ${theme.rpcNodeSelecledColor}` : `1px solid ${theme.strokeColor};`};

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
    color: ${({ theme }) => theme.regularText};
    font-size: ${FontSize.lg};
    line-height: 18px;

    &.user-node {
      font-size: ${FontSize.md};
      line-height: 16px;
    }
  }

  &.add_node {
    justify-content: space-between;
    cursor: default;

    .add-new-node-title {
      width: 100%;
      font-weight: ${FontWeight.semibold};
      font-size: ${FontSize.lg};
      line-height: 18px;
      color: ${({ theme }) => theme.regularText};
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
