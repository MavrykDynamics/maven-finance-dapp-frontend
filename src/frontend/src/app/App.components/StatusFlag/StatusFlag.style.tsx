import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { ProposalStatus } from 'providers/ProposalsProvider/helpers/proposals.const'

import {
  STATUS_FLAG_UP,
  STATUS_FLAG_DOWN,
  StatusFlagKind,
  STATUS_FLAG_INFO,
  STATUS_FLAG_WARNING,
  STATUS_FLAG_WAITING,
} from './StatusFlag.constants'

export const StatusFlagStyled = styled.div<{ theme: MavrykTheme; kind: StatusFlagKind }>`
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

  ${({ kind }) => {
    switch (kind) {
      case ProposalStatus.EXECUTED:
      case ProposalStatus.LOCKED:
      case STATUS_FLAG_UP:
        return css`
          color: ${({ theme }) => theme.upColor};
          border-color: ${({ theme }) => theme.upColor};
        `
      case ProposalStatus.DEFEATED:
      case ProposalStatus.DROPPED:
      case ProposalStatus.TIMELOCK:
      case STATUS_FLAG_DOWN:
        return css`
          color: ${({ theme }) => theme.downColor};
          border-color: ${({ theme }) => theme.downColor};
        `
      case ProposalStatus.ONGOING:
      case ProposalStatus.UNLOCKED:
      case STATUS_FLAG_INFO:
        return css`
          color: ${({ theme }) => theme.infoColor};
          border-color: ${({ theme }) => theme.infoColor};
        `
      case ProposalStatus.WAITING:
      case STATUS_FLAG_WARNING:
        return css`
          color: ${({ theme }) => theme.warningColor};
          border-color: ${({ theme }) => theme.warningColor};
        `
      case STATUS_FLAG_WAITING:
      default:
        return css`
          color: ${({ theme }) => theme.riskColor};
          border-color: ${({ theme }) => theme.riskColor};
        `
    }
  }}
`
