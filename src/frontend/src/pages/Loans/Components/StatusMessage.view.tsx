import React from 'react'

import { Timer } from 'app/App.components/Timer/Timer.controller'
import { StatusMessageStyled } from './LoansComponents.style'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { ThemeColorsType } from 'styles'
import dayjs from 'dayjs'

type Props = {
  status: string
  theme: ThemeColorsType
  isLoading?: boolean
  gracePeriodTimestamp: number | null
}

export const StatusMessage = ({ status, theme, isLoading, gracePeriodTimestamp }: Props) => {
  if (isLoading) return null

  const timerOptions = { defaultColor: theme.primaryText, negativeColor: theme.downColor }

  const isGracePeriodTimerFinished = gracePeriodTimestamp && dayjs().valueOf() >= dayjs(gracePeriodTimestamp).valueOf()

  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return (
        <StatusMessageStyled className={status}>
          <Icon id="error-triangle" />
          This vault can now be liquidated. Over-collateralize this vault or repay the loan immediately to prevent
          liquidation.
        </StatusMessageStyled>
      )
    case vaultsStatuses.GRACE_PERIOD:
      return (
        <StatusMessageStyled className={status}>
          <Icon id="error-triangle" />
          {isGracePeriodTimerFinished || !gracePeriodTimestamp ? (
            <p>
              This vault has been marked for liquidation and is in its <span>grace period</span>.
            </p>
          ) : (
            <p>
              This vault has been marked for liquidation and is in its grace period. You have{' '}
              <div className="timer">
                <Timer timestamp={gracePeriodTimestamp} options={timerOptions} />
              </div>{' '}
              over-collateralize this vault or repay the loan to prevent liquidation.
            </p>
          )}
        </StatusMessageStyled>
      )
    case vaultsStatuses.AT_RISK:
      return (
        <StatusMessageStyled className={status}>
          <Icon id="error-triangle" />
          This vault is at risk of being open to liquidation. Over-collateralize this vault or repay the loan to prevent
          reaching your liquidation point.
        </StatusMessageStyled>
      )
    default:
      return null
  }
}
