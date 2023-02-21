import styled from 'styled-components/macro'
import { MavrykTheme } from 'styles/interfaces'

export const InfoBlock = styled.blockquote<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.connectInfoColor};
  border: 1px solid ${({ theme }) => theme.valueColor};
  border-radius: 10px;
  margin: 0;
  padding: 8px 20px;

  &,
  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .infoIcon {
    stroke: ${({ theme }) => theme.textColor};
    height: 16px;
    width: 16px;
    margin-right: 19px;
    flex-shrink: 0;
  }

  p {
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    margin: 0;
    color: ${({ theme }) => theme.textColor};
  }

  &.error {
    border-color: ${({ theme }) => theme.dangerColor};
    min-height: 100px;
    padding: 20px 40px;

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
    }

    .infoIcon {
      stroke: ${({ theme }) => theme.downColor};
      stroke-width: 2;
      margin-right: 0;
    }
  }

  &.warning {
    border-color: ${({ theme }) => theme.downColor};
    min-height: 64px;
    padding: 20px 30px;

    p {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      width: 100%;
      padding-left: 20px;
    }

    .infoIcon {
      stroke: ${({ theme }) => theme.downColor};
      stroke-width: 2;
      margin-right: 0;
      width: 16px;
      height: 16px;
    }
  }

  &.no-edit-info {
    margin-top: 20px;
  }

  &.indent-bottom {
    margin-top: 30px;

    &.warning {
      .infoIcon {
        stroke: none;
        stroke-width: 0.3;
        fill: ${({ theme }) => theme.downColor};
      }
    }
  }
`
