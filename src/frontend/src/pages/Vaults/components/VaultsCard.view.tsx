import React, { useEffect, useState } from 'react'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowindExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'

// styles
import { VaultsCardDropDown, VaultsAssest } from './../Vaults.style'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'
import { StatusFlagStyle } from '../../../app/App.components/StatusFlag/StatusFlag.constants'
import { HeaderOptions } from 'pages/Loans/Components/BorrowindExpandCard'

// helpers
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { vaultsStatuses } from '../Vaults.consts' 
import { getTimestampByLevel } from 'pages/Governance/Governance.actions'
import { BLOCKS_PER_MINUTE } from 'utils/constants'

const findStatusInfo = (status: string) => {
  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return { color: 'down', text: 'Liquidation Armed' }
    case vaultsStatuses.GRACE_PERIOD:
      return { color: 'darkWarning', text: 'Grace Period' }
    case vaultsStatuses.MARK:
      return { color: 'warning', text: 'Ready to Arm' }
    case vaultsStatuses.AT_RISK:
      return { color: 'waiting', text: 'At Risk' }
    case vaultsStatuses.ACTIVE:
      return { color: 'up', text: 'Low Risk' }

    default:
      return { color: 'info', text: 'no data'}
  }
}

const findFooterText = (status: string, statusColor: StatusFlagStyle, timestamp?: number) => {
  const timer = timestamp 
    ? (
    <div className='timer'>
      <Timer
        timestamp={timestamp}
        options={{ defaultColor: '#77A4F2', negativeColor: '#77A4F2' }}
      />
    </div>)
    : <span className='timer'>no data</span>

  switch (status) {
    case vaultsStatuses.LIQUIDATABLE:
      return <p>This vault is <span className={statusColor}>armed for liquidation</span> and can be liquidated for the next {timer}</p>
    case vaultsStatuses.GRACE_PERIOD:
      return <p>This vault is in a <span className={statusColor}>grace period</span>. The vault owner has {timer} before liquidation is possible.</p>
    case vaultsStatuses.MARK:
      return <p>This vault is <span className={statusColor}>ready to arm</span> and can be marked for the next {timer}</p>

    default:
      return ''
  }
}

const headerOptions: HeaderOptions = {
  columnNames: {
    collateralBalance: 'Collateral Value',
    borrowedAmount: 'Borrowed Amount',
  },
  reverseColumns: true,
}

type Props = VaultType & {
  isOwner: boolean
  handleLiquidateVault: (vaultId: number, vaultOwner: string, liquidateAmount: number) => void
  handleMarkForLiquidation: (vaultId: number, vaultOwner: string) => void
}

export const VaultsCard = (props: Props) => {
  const {
    ownerId,
    vaultId,
    status,
    currentBlockLevel,
    liquidationEndLevel,
    markedForLiquidationLevel,
    liquidationDelayInMinutes,
    borrowedAsset: { assetIcon, assetSymbol, collateralBalance, amtBorrowed, assetRate = 1 },
    collateralData,
    isOwner,
    handleLiquidateVault,
    handleMarkForLiquidation,
  } = props
  const [expanded, setExpanded] = useState(false)
  const [timerTimestamp, setTimerTimestamp] = useState<number | undefined>(undefined)

  const statusColor = findStatusInfo(status).color as StatusFlagStyle
  const statusText = findStatusInfo(status).text
  const footerText = findFooterText(status, statusColor, timerTimestamp)

  const isActiveFooter = 
  status === vaultsStatuses.LIQUIDATABLE ||
  status === vaultsStatuses.GRACE_PERIOD ||
  status === vaultsStatuses.MARK

  const isMarkStatus = vaultsStatuses.MARK === status

  const getCountdownTimestamp = async (levelOfEarly: number, levelOfLate: number) => {
    const [timestampOfEarly, timestampOfLate] = await Promise.all([getTimestampByLevel(levelOfEarly), getTimestampByLevel(levelOfLate)])

    return {
      timestampOfEarly,
      timestampOfLate,
    }
  }

  useEffect(() => {
    if (!expanded) return

    if (status === vaultsStatuses.GRACE_PERIOD) {
      ;(async () => {
        if (!currentBlockLevel) {
          setTimerTimestamp(undefined)
          return 
        }
        
        const levelOfEarly = currentBlockLevel
        const levelOfLate = markedForLiquidationLevel + (liquidationDelayInMinutes * BLOCKS_PER_MINUTE)

        const response = await getCountdownTimestamp(levelOfEarly, levelOfLate)
        const timestamp =  new Date(response.timestampOfEarly).getTime() - new Date(response.timestampOfLate).getTime() + new Date().getTime()
        
        setTimerTimestamp(timestamp)
      })()
    } else if (status === vaultsStatuses.LIQUIDATABLE) {
      ;(async () => {
        if (!currentBlockLevel || !liquidationEndLevel) {
          setTimerTimestamp(undefined)
          return 
        }
        
        const response = await getCountdownTimestamp(currentBlockLevel, liquidationEndLevel)
        const timestamp =  new Date(response.timestampOfEarly).getTime() - new Date(response.timestampOfLate).getTime() + new Date().getTime()

        setTimerTimestamp(timestamp)
      })()
    } 
  }, [status, expanded, currentBlockLevel, markedForLiquidationLevel, liquidationDelayInMinutes, liquidationEndLevel])

  const headerSufix = (
    <StatusFlag status={statusColor} text={status} className="sufix" />
  )

  const generalExpand = (
      <VaultsCardDropDown>
        <div className='body'>
          <div className='left-part'>
            <h1>Vault Overview</h1>

            <div className='group'>
              <div>
                Vault Owner
                <TzAddress type={CYAN} tzAddress={ownerId} />
              </div>
              <div>
                <div className='title'>
                  Vault Risk
                  <Icon id='info' className='info-icon' />
                </div>

                <div className={statusColor}>{statusText}</div> 
              </div>
            </div>

            <div className='group'>
              <div>
                <div className='title'>
                  Liquidation Price
                  <Icon id='info' className='info-icon' /> 
                </div>

                <CommaNumber value={400_999_000} beginningText='$' className='value' />
              </div>

              <div>
                <div className='title'>
                  Liquidation Cost
                  <Icon id='info' className='info-icon' /> 
                </div>

                <CommaNumber value={400_999_000} beginningText='$' className='value' />
              </div>
            </div>
          </div>
          
          <div className='right-part'>
            <h1>Vault Assets</h1>
            
            <div className='table-size'>
              <VaultsAssest>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Balance</th>
                    <th>Collateral %</th>
                  </tr>
                </thead>

                <tbody>
                  {collateralData.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          {assetIcon ? (
                            <div className="img-wrapper">
                              <img src={assetIcon} alt={`${assetSymbol} logo`} />
                            </div>
                          ) : (
                            <div className="no-icon">
                              <Icon id="noImage" />
                            </div>
                          )}

                          {item.assetSymbol}
                        </div>
                      </td>

                      <td >
                        <CommaNumber value={collateralBalance} beginningText='$' className='balance' />
                        {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="~$" className="rate" /> : null}
                      </td>

                      <td>{item.collateralShare}%</td>
                    </tr>
                  ))}
                </tbody>
              </VaultsAssest>
            </div>
          </div>
        </div>

        {(footerText && isActiveFooter) && (
          <div className='footer'>
            {footerText}

            <Button
              text={isMarkStatus ? "Mark for Liquidation" : "Liquidate Vault"}
              kind={ACTION_PRIMARY}
              onClick={() => {
                return isMarkStatus
                  ? handleMarkForLiquidation(vaultId, ownerId)
                  // TODO: add valid arg3
                  : handleLiquidateVault(vaultId, ownerId, 1)
              }}
              disabled={vaultsStatuses.GRACE_PERIOD === status}
            />
          </div>
        )}
      </VaultsCardDropDown>
  )

  return (
    <>
      {isOwner ? (
        <BorrowingExpandCard
          {...props}
          className="expand-vault"
          headerSufix={headerSufix}
          getExpandedStatus={setExpanded}
          timestamp={timerTimestamp}
          isVaultsPage
          isOwner
          options={headerOptions}
        />
      ) : (
        <BorrowingExpandCard
          {...props}
          className="expand-vault"
          headerSufix={headerSufix}
          getExpandedStatus={setExpanded}
          isVaultsPage
          options={headerOptions}
        >
          {generalExpand}
        </BorrowingExpandCard>
      )}
    </>
  )
}
