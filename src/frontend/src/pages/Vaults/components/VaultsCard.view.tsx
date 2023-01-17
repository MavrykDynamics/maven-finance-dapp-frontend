import * as React from 'react'

// components
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { BorrowingExpandCard } from 'pages/Loans/Components/BorrowindExpandCard'

// styles
import { VaultsCardTitleTextGroup, VaultsCardDropDown, VaultsAssest } from './../Vaults.style'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults'
import { StatusFlagStyle } from '../../../app/App.components/StatusFlag/StatusFlag.constants'

// helpers
import { BLUE, CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { VaultsStatuses } from '../Vaults.view'

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

const findFooterText = (status: string, statusColor: StatusFlagStyle, timer: string) => {
  switch (status) {
    case VaultsStatuses.LIQUIDATABLE:
      return <p>This vault is <span className={statusColor}>armed for liquidation</span> and can be liquidated for the next <span className='timer'>{timer}</span></p>
    case VaultsStatuses.GRACE_PERIOD:
      return <p>This vault is in a <span className={statusColor}>grace period</span>. The vault owner has <span className='timer'>{timer}</span> before liquidation is possible.</p>
    case VaultsStatuses.MARK:
      return <p>This vault is <span className={statusColor}>ready to arm</span> and can be marked for the next <span className='timer'>{timer}</span></p>

    default:
      return ''
  }
}

type Props = VaultType & {
  isOwner: boolean
}

export const VaultsCard = (props: Props) => {
  const {
    address,
    ownerId,
    borrowedAsset: { assetIcon, assetSymbol, collateralBalance, amtBorrowed, assetRate = 1 },
    collateralData,
    isOwner,
  } = props

  const statusColor = findStatusInfo(VaultsStatuses.AT_RISK).color as StatusFlagStyle
  const statusText = findStatusInfo(VaultsStatuses.AT_RISK).text
  const status = VaultsStatuses.AT_RISK
  const footerText = findFooterText(status, statusColor, '20hr 15m 22s')

  const isActiveFooter = 
  status === VaultsStatuses.LIQUIDATABLE ||
  status === VaultsStatuses.GRACE_PERIOD ||
  status === VaultsStatuses.MARK

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
      <VaultsCardTitleTextGroup>
        <h3>Collateral Ratio</h3>
        <div className='ratio'>
          in progress...
        </div>
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
    <StatusFlag status={statusColor} text={status} />
  )

  const generalExpand = (
    <Expand
      className="expand-vault"
      header={header}
      sufix={headerSufix}
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
              text={VaultsStatuses.MARK === status ? "Mark for Liquidation" : "Liquidate Vault"}
              kind={ACTION_PRIMARY}
              // TODO: add handlers
              onClick={() => {}}
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
          header={header}
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
