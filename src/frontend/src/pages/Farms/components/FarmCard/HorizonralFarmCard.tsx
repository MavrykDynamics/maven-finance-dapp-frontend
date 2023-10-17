import classNames from 'classnames'

// view
import { HorizontalFarmCardStyled } from './FarmCard.style'
import { FarmCardHarvest } from './cardParts/FarmCardHarvest'
import { FarmCardHeader } from './cardParts/FarmCardHeader'
import Icon from 'app/App.components/Icon/Icon.view'
import { FarmCardActions } from './cardParts/FarmCardActions'
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ExpandSimple from 'app/App.components/Expand/ExpandSimple.view'

// utils
import { calculateFarmAPY, getFarmUserDepositedAmount } from 'providers/FarmsProvider/helpers/farms.utils'
import { convertNumberForClient } from 'utils/calcFunctions'

// hooks
import { useUserContext } from 'providers/UserProvider/user.provider'

// consts
import { BUTTON_SIMPLE } from 'app/App.components/Button/Button.constants'

// types
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'

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

  const userReward = userAddress ? farm.farmDepositors[userAddress]?.rewardsToClaim : 0

  const tokenName = farm.isMFarm
    ? farmToken.symbol
    : `${farmToken.farmLpData.token0?.symbol}-${farmToken.farmLpData.token1?.symbol}`

  const totalLiquidityAmount = convertNumberForClient({ number: farm.liquidityTokenBalance, grade: farmToken.decimals })
  const farmApy = calculateFarmAPY(farm.currentRewardPerBlock, totalLiquidityAmount)
  const userDepositedAmount = getFarmUserDepositedAmount({
    farmDepositors: farm?.farmDepositors,
    userAddress,
    farmToken: farmToken,
  })

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
              farmCreator={farm.creatorAddress}
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
                <CommaNumber value={farmApy} endingText="%" />
                {/* TODO: add open ROI calc handler */}
                {/* <Button kind={BUTTON_SIMPLE} disabled>
                  <Icon id="calculator" />
                </Button> */}
              </div>
            </div>

            <div className="column">
              <div className="name">Total Liquidity</div>
              {/* TODO: use beginningText="$" when we will have rate for lpTokens, currently Total Liquidity is in lpTokens amount */}
              <CommaNumber value={totalLiquidityAmount} className="value" />
            </div>

            <div className={classNames('double-rewards-tag', { isTransparent: !farm.isMFarm })}>
              <Icon id={'loans'} /> Double Rewards
            </div>
          </>
        }
      >
        <div className="expand-child">
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
            userDepositedAmount={userDepositedAmount}
          />

          <div className="links">
            <a
              target="_blank"
              rel="noreferrer"
              href={`${process.env.REACT_APP_TZKT_LINK}/${farm.liquidityTokenAddress}`}
            >
              Get {tokenName} <Icon id="send" />
            </a>
            <a target="_blank" rel="noreferrer" href={`${process.env.REACT_APP_TZKT_LINK}/${farm.address}`}>
              View Contract <Icon id="send" />
            </a>
          </div>
        </div>
      </ExpandSimple>
    </HorizontalFarmCardStyled>
  )
}
