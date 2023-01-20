import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'

// components
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowindExpandCard'
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { GradientDiagram } from 'app/App.components/GriadientFillDiagram/GradientDiagram'

// styles
import { VaultsCardTitleTextGroup, VaultsCardDropDown, VaultsAssest } from './../Vaults.style'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'
import { StatusFlagStyle } from '../../../app/App.components/StatusFlag/StatusFlag.constants'

// helpers
import { BLUE, CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { VaultsStatuses } from '../Vaults.view'
import { getTimestampByLevel } from 'pages/Governance/Governance.actions'
import { BLOCKS_PER_MINUTE } from 'utils/constants'
import { COLLATERAL_RATIO_GRADIENT } from 'pages/Loans/Loans.const'

const findStatusInfo = (status: string) => {
  switch (status) {
    case VaultsStatuses.LIQUIDATABLE:
      return { color: 'down', text: 'Liquidation Armed' }
    case VaultsStatuses.GRACE_PERIOD:
      return { color: 'darkWarning', text: 'Grace Period' }
    case VaultsStatuses.MARK:
      return { color: 'warning', text: 'Ready to Arm' }
    case VaultsStatuses.AT_RISK:
      return { color: 'waiting', text: 'At Risk' }
    case VaultsStatuses.ACTIVE:
      return { color: 'up', text: 'Low Risk' }

    default:
      return { color: 'info', text: 'no data'}
  }
}

const collateralUtilization = 0 // TODO add data from indexer

const findFooterText = (status: string, statusColor: StatusFlagStyle, timestamp: number | null) => {
  const timer = timestamp 
    ? (<Timer
      timestamp={timestamp}
      className='timer'
      options={{ defaultColor: '#77A4F2', negativeColor: '#77A4F2' }}
    />)
    : <span className='timer'>no data</span>

  switch (status) {
    case VaultsStatuses.LIQUIDATABLE:
      return <p>This vault is <span className={statusColor}>armed for liquidation</span> and can be liquidated for the next {timer}</p>
    case VaultsStatuses.GRACE_PERIOD:
      return <p>This vault is in a <span className={statusColor}>grace period</span>. The vault owner has {timer}before liquidation is possible.</p>
    case VaultsStatuses.MARK:
      return <p>This vault is <span className={statusColor}>ready to arm</span> and can be marked for the next {timer}</p>

    default:
      return ''
  }
}

type Props = VaultType & {
  isOwner: boolean
  handleLiquidateVault: (vaultId: number, vaultOwner: string, liquidateAmount: number) => void
  handleMarkForLiquidation: (vaultId: number, vaultOwner: string) => void
}

export const VaultsCard = (props: Props) => {
  const {
    address,
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
  const [countdownTimer, setCountdownTimer] = useState<number | null>(null)

  const statusColor = findStatusInfo(status).color as StatusFlagStyle
  const statusText = findStatusInfo(status).text
  const footerText = findFooterText(status, statusColor, countdownTimer)

  const isActiveFooter = 
  status === VaultsStatuses.LIQUIDATABLE ||
  status === VaultsStatuses.GRACE_PERIOD ||
  status === VaultsStatuses.MARK

  const isMarkStatus = VaultsStatuses.MARK === status

  const getCountdownTimestamp = async (levelOfEarly: number, levelOfLate: number) => {
    const [timestampOfEarly, timestampOfLate] = await Promise.all([getTimestampByLevel(levelOfEarly), getTimestampByLevel(levelOfLate)])

    return {
      timestampOfEarly,
      timestampOfLate,
    }
  }

  useEffect(() => {
    if (!expanded) return

    if (status === VaultsStatuses.GRACE_PERIOD) {
      const fetchData = async () => {
        if (!currentBlockLevel) {
          setCountdownTimer(null)
          return 
        }
        
        const levelOfEarly = currentBlockLevel
        const levelOfLate = markedForLiquidationLevel + (liquidationDelayInMinutes * BLOCKS_PER_MINUTE)

        const response = await getCountdownTimestamp(levelOfEarly, levelOfLate)
        const timestamp = dayjs(response.timestampOfEarly).unix() - dayjs(response.timestampOfLate).unix()

        console.log({
          timestamp,
          dataFirst: response.timestampOfEarly,
          dataSecond: response.timestampOfLate,
          unixFirst: dayjs(response.timestampOfEarly).unix(),
          unixSecond: dayjs(response.timestampOfLate).unix()
        });
        
        setCountdownTimer(timestamp)
      }

      fetchData()
    } else if (status === VaultsStatuses.LIQUIDATABLE) {
      const fetchData = async () => {
        if (!currentBlockLevel || !liquidationEndLevel) {
          setCountdownTimer(null)
          return 
        }
        
        const response = await getCountdownTimestamp(currentBlockLevel, liquidationEndLevel)
        const timestamp = dayjs(response.timestampOfEarly).unix() - dayjs(response.timestampOfLate).unix()

        setCountdownTimer(timestamp)
      }

      fetchData()
    } 
  }, [status, expanded])

  const header = (
    <>
      <div className='group-with-icon'>
        {assetIcon ? (
          <div className="img-wrapper">
            <img src={assetIcon} alt={`${assetSymbol} logo`} />
          </div>
        ) : (
          <div className="no-icon">
            <Icon id="noImage" />
          </div>
        )}
        <VaultsCardTitleTextGroup>
          <h2>{assetSymbol}</h2>
          <TzAddress type={BLUE} tzAddress={address} />
        </VaultsCardTitleTextGroup>
      </div>
      <VaultsCardTitleTextGroup className="collateral-diagram">
        <div className={`percentage ${Number(collateralUtilization) / 100 > 2.5 ? 'up' : 'down'}`}>
          Collateral Ratio
          {/* <CommaNumber value={collateralUtilization} endingText="%" /> */}
        </div>
        <GradientDiagram
          className="diagram"
          colorBreakpoints={COLLATERAL_RATIO_GRADIENT}
          currentPersentage={50}
        />
      </VaultsCardTitleTextGroup>
      <VaultsCardTitleTextGroup>
        <h3>Collateral Value</h3>
        <CommaNumber value={collateralBalance} beginningText='$' className='header-value' />
      </VaultsCardTitleTextGroup>
      <VaultsCardTitleTextGroup>
        <h3>Borrowed Value</h3>
        <CommaNumber value={amtBorrowed} beginningText='$' className='header-value' />
        {assetRate ? <CommaNumber value={amtBorrowed * assetRate} beginningText="$" className="rate" /> : null}
      </VaultsCardTitleTextGroup>
    </>
  )

  const headerSufix = (
    <StatusFlag status={statusColor} text={status} className="sufix" />
  )

  const generalExpand = (
    <Expand
      className="expand-vault"
      header={header}
      sufix={headerSufix}
      getExpandedStatus={setExpanded}
    >
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
              disabled={VaultsStatuses.GRACE_PERIOD === status}
            />
          </div>
        )}
      </VaultsCardDropDown>
    </Expand>
  )

  return (
    <>
      {isOwner ? (
        <BorrowingExpandCard
          {...props}
          // header={header}
          headerSufix={headerSufix}
          className="expand-vault"
          isVaultsPage
          isOwner
        />
      ) : (
        <>{generalExpand}</>
      )}
    </>
  )
}
