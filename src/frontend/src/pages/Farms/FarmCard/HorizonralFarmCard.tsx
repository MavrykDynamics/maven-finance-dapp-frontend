// view
import { HorizontalFarmCardStyled } from './FarmCard.style'
import { FarmCardHarvest } from './cardParts/FarmCardHarvest'
import { FarmCardHeader } from './cardParts/FarmCardHeader'
import { FarmCardActions } from './cardParts/FarmCardActions'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

// types
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'
import Icon from 'app/App.components/Icon/Icon.view'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import classNames from 'classnames'

type HorizontalFarmCardPropsType = {
  farm: FarmRecordType
  farmToken: FarmsTokenMetadataType
  isCardOpened: boolean
  harvestRewards: () => void
  expandCallback: () => void
}

export const HorizontalFarmCard = ({
  farm,
  farmToken,
  isCardOpened,
  harvestRewards,
  expandCallback,
}: HorizontalFarmCardPropsType) => {
  const { userAddress } = useUserContext()
  const { availableFarmRewards } = useUserRewards()

  const userReward = availableFarmRewards[farm.address]

  const tokenName = farm.isMFarm
    ? farmToken.symbol
    : `${farmToken.farmLpData.token0?.symbol}-${farmToken.farmLpData.token1?.symbol}`

  return (
    <HorizontalFarmCardStyled className={classNames({ isCardOpened })}>
      <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <ExpandSimple
        onClick={expandCallback}
        isExpanded={isCardOpened}
        header={
          <>
            <FarmCardHeader
              isMFarm={farm.isMFarm}
              farmName={farm.name}
              farmCreator="tz1byTGaUKjJqkwSXPnM3dpf9N39pYwRfnTm"
              farmToken={farmToken}
            />

            <div />

            <div className="column">
              <div className="name">Earn</div>
              <div className="value">sMVK</div>
            </div>

            <div className="column apy">
              <div className="name">APY</div>
              <div className="value">
                <CommaNumber value={12.5} endingText="%" />
                <Button kind={BUTTON_SIMPLE}>
                  <Icon id="calculator" />
                </Button>
              </div>
            </div>

            <div className="column">
              <div className="name">Total Liquidity</div>
              <CommaNumber value={1243829.5} beginningText="$" className="value" />
            </div>
          </>
        }
      >
        <div className="expand-child">
          <FarmCardHarvest userReward={userReward} harvestRewards={harvestRewards} />

          <FarmCardActions
            triggerDepositModal={() => {}}
            triggerWithdrawModal={() => {}}
            isFarmLive={farm.open}
            isMFarm={farm.isMFarm}
            farmToken={farmToken}
            userAddress={userAddress}
            userDepositedAmount={0}
          />

          <div className="links">
            {/* TODO: get link for this */}
            <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
              Get {tokenName} <Icon id="send" />
            </a>
            <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farm.address}`}>
              View Contract <Icon id="send" />
            </a>
          </div>
        </div>
      </ExpandSimple>
    </HorizontalFarmCardStyled>
  )
}
