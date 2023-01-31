import React from 'react'

import { Timer } from 'app/App.components/Timer/Timer.controller'
import { StatusMessageStyled } from './LoansComponents.style'
import { vaultsStatuses } from 'pages/Vaults/Vaults.consts'
import Icon from 'app/App.components/Icon/Icon.view'
import { skyColor } from 'styles'

const findStatusMessage = (status: string, timestamp?: number) => {
  const timer = timestamp ? (
    <div className="timer">
      <Timer timestamp={timestamp} options={{ defaultColor: skyColor, negativeColor: skyColor }} />
    </div>
  ) : (
    <span className="timer" style={{ color: skyColor }}>
      no data
    </span>
  )

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
          <div>
            <p>
              This vault has been marked for liquidation and is in its <span>grace period</span>. You have {timer}{' '}
              over-collateralize this vault or repay the
            </p>
            <p>loan to prevent liquidation.</p>
          </div>
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
      return <></>
  }
}

type Props = {
  timestamp?: number
  status: string
}

export const StatusMessage = ({ timestamp, status }: Props) => {
  return <>{findStatusMessage(status, timestamp)}</>
}
