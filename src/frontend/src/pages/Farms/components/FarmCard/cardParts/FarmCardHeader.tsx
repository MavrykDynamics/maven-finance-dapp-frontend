import styled from 'styled-components'

// consts
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

// view
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { FarmCardCoinIcons } from './FarmCardCoinIcons'

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

    .name {
      width: 100%;
      font-size: 22px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      text-align: right;
    }

    .creator {
      font-size: 14px;
      font-weight: 400;
    }
  }
`

export const FarmCardHeader = ({
  farmToken,
  farmName,
  isMFarm,
  farmCreator,
}: {
  farmToken: FarmsTokenMetadataType
  isMFarm: boolean
  farmName: string
  farmCreator: string
}) => (
  <FarmCardHeaderStyled className="farm-card-header">
    <div className="logo">
      <FarmCardCoinIcons farmToken={farmToken} isMFarm={isMFarm} />
    </div>

    <div className="info">
      <div className="name" title={farmName}>
        {farmName}
      </div>
      <TzAddress tzAddress={farmCreator} type={PRIMARY_TZ_ADDRESS_COLOR} className="creator" hasIcon={false} />
    </div>
  </FarmCardHeaderStyled>
)
