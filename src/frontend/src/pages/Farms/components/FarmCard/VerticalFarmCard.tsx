import classNames from 'classnames'

// types
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'

// view
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Button from 'app/App.components/Button/NewButton'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'
import { VerticalFarmCardStyled } from './FarmCard.style'
import { FarmCardHarvest } from './cardParts/FarmCardHarvest'
import { FarmCardHeader } from './cardParts/FarmCardHeader'
import { FarmCardActions } from './cardParts/FarmCardActions'

// consts
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'

// utils
import { calculateFarmAPY } from 'providers/FarmsProvider/helpers/farms.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

type VerticalFarmCardPropsType = {
  farm: FarmRecordType
  farmToken: FarmsTokenMetadataType
  isCardOpened: boolean
  harvestRewards: () => void
  expandCallback: () => void
  isDoubleRewards?: boolean
}

export const VerticalFarmCard = ({
  farm,
  farmToken,
  isCardOpened,
  harvestRewards,
  expandCallback,
  isDoubleRewards = true,
}: VerticalFarmCardPropsType) => {
  const { userAddress } = useUserContext()
  const { availableFarmRewards } = useUserRewards()

  const userReward = availableFarmRewards[farm.address]

  const tokenName = farm.isMFarm
    ? farmToken.symbol
    : `${farmToken.farmLpData.token0?.symbol}-${farmToken.farmLpData.token1?.symbol}`

  const totalLiquidityAmount = convertNumberForClient({ number: farm.liquidityTokenBalance, grade: farmToken.decimals })
  const farmApy = calculateFarmAPY(farm.currentRewardPerBlock, totalLiquidityAmount)

  return (
    <VerticalFarmCardStyled className={classNames({ isCardOpened })}>
      {isDoubleRewards ? (
        <div className="double-rewards-tag">
          <Icon id={'loans'} /> Double Rewards
        </div>
      ) : null}

      <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>

      <FarmCardHeader
        isMFarm={farm.isMFarm}
        farmName={farm.name}
        farmCreator={farm.creatorAddress}
        farmToken={farmToken}
        isVerticalFarm
      />

      <div className="farm-stats">
        <div className="row">
          <div className="name">APY</div>
          <div className="value">
            <CommaNumber value={farmApy} endingText="%" />
            {/* TODO: add open ROI calc handler */}
            <Button kind={BUTTON_SIMPLE} disabled>
              <Icon id="calculator" />
            </Button>
          </div>
        </div>

        <div className="row">
          <div className="name">Earn</div>
          <div className="value">sMVK</div>
        </div>

        <div className="row">
          <div className="name">Total Liquidity</div>
          {/* TODO: use beginningText="$" when we will have rate for lpTokens, currently Total Liquidity is in lpTokens amount */}
          <CommaNumber value={totalLiquidityAmount} className="value" />
        </div>
      </div>

      <FarmCardHarvest
        userReward={userReward}
        isFarmHasClaimDisabled={farm.claimPaused}
        harvestRewards={harvestRewards}
      />

      <FarmCardActions
        isFarmLive={farm.open}
        isMFarm={farm.isMFarm}
        farmToken={farmToken}
        farmAddress={farm.address}
        isFarmHasDepositDisabled={farm.depositPaused}
        isFarmHasWithdrawDisabled={farm.withdrawPaused}
        userAddress={userAddress}
        userDepositedAmount={0}
        isVertical
      />

      <ExpandSimple className="vertical-expand" onClick={expandCallback} isExpanded={isCardOpened}>
        <div className="links">
          {/* TODO: get link for this */}
          <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
            Get {tokenName} <Icon id="send" />
          </a>
          <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farm.address}`}>
            View Contract <Icon id="send" />
          </a>
        </div>
      </ExpandSimple>
    </VerticalFarmCardStyled>
  )
}
