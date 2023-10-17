import styled from 'styled-components'

// consts
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

// view
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { FARM_CARD_COINS_LARGE, FARM_CARD_COINS_MEDUIM, FarmCardCoinIcons } from './FarmCardCoinIcons'

// types
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

const FarmCardHeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  column-gap: 15px;
  padding: 0 20px;

  .info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    row-gap: 3px;

    .name {
      width: 100%;
      font-size: 22px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .creator {
      font-size: 14px;
      font-weight: 400;

      // TODO: remove when address will be in indexer
      display: none;
      visibility: hidden;
    }
  }
`

export const FarmCardHeader = ({
  farmToken,
  farmName,
  isMFarm,
  farmCreator,
  isVerticalFarm = false,
}: {
  farmToken: FarmsTokenMetadataType
  isMFarm: boolean
  isVerticalFarm?: boolean
  farmName: string
  farmCreator: string
}) => (
  <FarmCardHeaderStyled className="farm-card-header">
    <div className="logo">
      <FarmCardCoinIcons
        farmToken={farmToken}
        isMFarm={isMFarm}
        size={isVerticalFarm ? FARM_CARD_COINS_LARGE : FARM_CARD_COINS_MEDUIM}
      />
    </div>

    <div className="info">
      <div className="name" title={farmName}>
        {farmName}
      </div>
      <TzAddress tzAddress={farmCreator} type={PRIMARY_TZ_ADDRESS_COLOR} className="creator" hasIcon={false} />
    </div>
  </FarmCardHeaderStyled>
)
