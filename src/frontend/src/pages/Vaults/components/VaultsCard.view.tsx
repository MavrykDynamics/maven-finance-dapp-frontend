import * as React from 'react'

// components
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'
import { Button } from 'app/App.components/SettingsPopup/SettingsPopup.style'

// styles
import { VaultsCardTitleTextGroup, VaultsCardDropDown } from './../Vaults.style'

// helpers
import { BLUE, CYAN } from 'app/App.components/TzAddress/TzAddress.constants'

type Props = {
  address: string
}

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
          </div>
        </div>

        <div className='footer'>
          <p>This vault is armed for liquidation and can be liquidated for the next 20hr 15m 22s</p>
          <Button text="Liquidate Vault" kind="actionPrimary" onClick={() => {}} />
        </div>
      </VaultsCardDropDown>
    </Expand>
  )
}
