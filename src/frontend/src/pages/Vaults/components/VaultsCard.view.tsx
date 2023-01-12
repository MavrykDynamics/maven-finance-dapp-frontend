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

// helpers
import { BLUE, CYAN } from 'app/App.components/TzAddress/TzAddress.constants'

type Props = {
  address: string
}

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

export const VaultsCard = ({ address }: Props) => {
  return (
    <Expand
      className="expand"
      header={
        <>
          <div className='group-with-icon'>
            <Icon id="xtzTezos" />
            <VaultsCardTitleTextGroup>
              <h2>Tezos</h2>
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
            <CommaNumber value={400_999_000} beginningText='$' className='header-value' />
          </VaultsCardTitleTextGroup>
          <VaultsCardTitleTextGroup>
            <h3>Borrowed Value</h3>
            <CommaNumber value={400_999_000} beginningText='$' className='header-value' />
          </VaultsCardTitleTextGroup>
        </>
      }
      sufix={<StatusFlag status={'primary'} text={'status'} />}
    >
      <VaultsCardDropDown>
        <div className='body'>
          <div className='left-part'>
            <h1>Vault Overview</h1>

            <div className='group'>
              <div>
                Vault Owner
                <TzAddress type={CYAN} tzAddress={address} />
              </div>
              <div>
                <div className='title'>
                  Vault Risk
                  <Icon id='info' className='info-icon' />
                </div>

                <div>Liquidation Armed</div> 
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

        <div className='footer'>
          <p>This vault is armed for liquidation and can be liquidated for the next 20hr 15m 22s</p>
          <Button text="Liquidate Vault" kind={ACTION_PRIMARY} onClick={() => {}} />
        </div>
      </VaultsCardDropDown>
    </Expand>
  )
}
