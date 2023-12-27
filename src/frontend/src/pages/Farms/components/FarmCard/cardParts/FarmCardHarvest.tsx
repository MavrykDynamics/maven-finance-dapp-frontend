import styled from 'styled-components'

// view
import { Card } from 'styles'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

const FarmCardHarvestStyled = styled(Card)`
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 1fr;

  column-gap: 4px;
  padding: 20px;
  margin: 15px 0 0 0;

  border: 1px solid ${({ theme }) => theme.divider};

  .info {
    display: flex;
    flex-direction: column;

    .name {
      line-height: 24px;
    }
  }
`

export const FarmCardHarvest = ({
  userReward = 0,
  isFarmHasClaimDisabled,
  harvestRewards,
}: {
  userReward?: number
  isFarmHasClaimDisabled: boolean
  harvestRewards: () => void
}) => (
  <FarmCardHarvestStyled className="farm-harvest">
    <div className="info">
      <div className="name">Unclaimed sMVN</div>
      <CommaNumber className="value" value={userReward} />
    </div>
    <Button
      kind={BUTTON_PRIMARY}
      form={BUTTON_WIDE}
      onClick={harvestRewards}
      disabled={userReward === 0 || isFarmHasClaimDisabled}
    >
      Harvest
    </Button>
  </FarmCardHarvestStyled>
)
