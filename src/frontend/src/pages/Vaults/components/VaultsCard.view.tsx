import * as React from 'react'

// components
import Expand from 'app/App.components/Expand/Expand.view'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from 'app/App.components/Icon/Icon.view'

// styles
import { VaultsCardTitleTextGroup } from './../Vaults.style'

// helpers
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'

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

    </Expand>
  )
}
