import * as React from 'react'

// components
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'
import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'

// styles
import { VaultsCardTitleTextGroup, VaultsCardDropDown, VaultsAssest } from './../Vaults.style'

// types
import { VaultType } from 'utils/TypesAndInterfaces/Vaults' 

// helpers
import { BLUE, CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { VaultsStatuses } from '../Vaults.view'

const mock = [
  {
    asset: 'xtzTezos',
    assetName: 'EURL',
    balance: [1423, 1245.12],
    collateral: 15
  },
  {
    asset: 'mvkTokenGold',
    assetName: 'sMVK',
    balance: [1122, 1245.12],
    collateral: 12
  },
  {
    asset: 'xtzTezos',
    assetName: 'EURL',
    balance: [1000, 1245.12],
    collateral: 34
  },
  {
    asset: 'mvkTokenGold',
    assetName: 'sMVK',
    balance: [1220, 1245.12],
    collateral: 21
  },
  {
    asset: 'xtzTezos',
    assetName: 'EURL',
    balance: [1320, 1245.12],
    collateral: 19
  },
]

const findStatusColor = (status: string) => {
  switch (status) {
    case VaultsStatuses.LIQUIDATABLE:
      return 'down'
    case VaultsStatuses.GRACE_PERIOD:
      return 'darkWarning'
    case VaultsStatuses.MARK:
      return 'warning'
    case VaultsStatuses.AT_RISK:
      return 'waiting'
    case VaultsStatuses.ACTIVE:
      return 'up'

    default:
      return 'info'
  }
}

const findFooterText = (status: string, statusColor: string, timer: string) => {
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
  ktAddress: string
}

export const VaultsCard = (props: Props) => {
  const {
    ktAddress,
    borrowedAsset: { assetIcon, assetSymbol, collateralBalance, amtBorrowed, assetRate = 1 }
  } = props

  const statusColor = findStatusColor(VaultsStatuses.LIQUIDATABLE)
  const status = VaultsStatuses.LIQUIDATABLE
  const footerText = findFooterText(status, statusColor, '20hr 15m 22s')

  return (
    <Expand
      className="expand"
      header={
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
              <TzAddress type={BLUE} tzAddress={ktAddress} />
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
      }
      sufix={<StatusFlag status={statusColor} text={status} />}
    >
      <VaultsCardDropDown>
        <div className='body'>
          <div className='left-part'>
            <h1>Vault Overview</h1>

            <div className='group'>
              <div>
                Vault Owner
                <TzAddress type={CYAN} tzAddress={ktAddress} />
              </div>
              <div>
                <div className='title'>
                  Vault Risk
                  <Icon id='info' className='info-icon' />
                </div>

                <div className={statusColor}>Liquidation Armed</div> 
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
                  {mock.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div>
                          <Icon id={item.asset} />
                          {item.assetName}
                        </div>
                      </td>

                      <td>
                        <div className='balance'>{item.balance[0]}</div>
                        <span>~{item.balance[1]}</span>
                      </td>

                      <td>{item.collateral}%</td>
                    </tr>
                  ))}
                </tbody>
              </VaultsAssest>
            </div>
          </div>
        </div>

        {footerText && (
          <div className='footer'>
            {footerText}
            <Button text="Liquidate Vault" kind={ACTION_PRIMARY} onClick={() => {}} />
          </div>
        )}
      </VaultsCardDropDown>
    </Expand>
  )
}
