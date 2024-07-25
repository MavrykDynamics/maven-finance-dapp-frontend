import styled, { css } from 'styled-components'
import { MavenTheme } from '../../../styles/interfaces'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

import {
  STATUS_FLAG_UP,
  STATUS_FLAG_DOWN,
  StatusFlagKind,
  STATUS_FLAG_INFO,
  STATUS_FLAG_WARNING,
  STATUS_FLAG_WAITING,
} from './StatusFlag.constants'

export const StatusFlagStyled = styled.div<{ theme: MavenTheme; $kind: StatusFlagKind; $isFilled: boolean }>`
  border-radius: 10px;
  border: 1px solid;
  text-align: center;
  font-weight: 600;
  width: 110px;
  padding: 0;
  font-size: 12px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.expand-gov-status {
    margin-left: auto;
  }

  ${({ $kind, $isFilled }) => {
    switch ($kind) {
      case ProposalStatus.EXECUTED:
      case ProposalStatus.LOCKED:
      case STATUS_FLAG_UP:
        return css`
          color: ${({ theme }) => ($isFilled ? theme.cards : theme.upColor)};
          background-color: ${({ theme }) => ($isFilled ? theme.upColor : 'initial')};
          border-color: ${({ theme }) => theme.upColor};

          [data-dot-loader='true'] {
            background-color: ${({ theme }) => theme.upColor};
          }
        `
      case ProposalStatus.DEFEATED:
      case ProposalStatus.DROPPED:
      case ProposalStatus.TIMELOCK:
      case STATUS_FLAG_DOWN:
        return css`
          color: ${({ theme }) => ($isFilled ? theme.cards : theme.downColor)};
          background-color: ${({ theme }) => ($isFilled ? theme.downColor : 'initial')};
          border-color: ${({ theme }) => theme.downColor};

          [data-dot-loader='true'] {
            background-color: ${({ theme }) => theme.downColor};
          }
        `
      case ProposalStatus.ONGOING:
      case ProposalStatus.UNLOCKED:
      case STATUS_FLAG_INFO:
        return css`
          color: ${({ theme }) => ($isFilled ? theme.cards : theme.infoColor)};
          background-color: ${({ theme }) => ($isFilled ? theme.infoColor : 'initial')};
          border-color: ${({ theme }) => theme.infoColor};

          [data-dot-loader='true'] {
            background-color: ${({ theme }) => theme.infoColor};
          }
        `
      case ProposalStatus.WAITING:
      case STATUS_FLAG_WARNING:
        return css`
          color: ${({ theme }) => ($isFilled ? theme.cards : theme.warningColor)};
          background-color: ${({ theme }) => ($isFilled ? theme.warningColor : 'initial')};
          border-color: ${({ theme }) => theme.warningColor};

          [data-dot-loader='true'] {
            background-color: ${({ theme }) => theme.warningColor};
          }
        `
      case STATUS_FLAG_WAITING:
      default:
        return css`
          color: ${({ theme }) => ($isFilled ? theme.cards : theme.riskColor)};
          background-color: ${({ theme }) => ($isFilled ? theme.riskColor : 'initial')};
          border-color: ${({ theme }) => theme.riskColor};

          [data-dot-loader='true'] {
            background-color: ${({ theme }) => theme.riskColor};
          }
        `
    }
  }}
`
