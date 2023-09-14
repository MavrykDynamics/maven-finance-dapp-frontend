import { useContext } from 'react'
import { useDispatch } from 'react-redux'

// types
import type { FarmsViewVariantType } from '../Farms.const'

// view
import Expand from '../../../app/App.components/Expand/Expand.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import ConnectWalletBtn from '../../../app/App.components/ConnectWallet/ConnectWalletBtn'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { harvest } from '../Farms.actions'
import Icon from '../../../app/App.components/Icon/Icon.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// helpers
import { calculateAPY } from '../Farms.helpers'

// styles
import { FarmCardStyled, FarmHarvestStyled, FarmStakeStyled } from './FarmCard.style'
import { FarmStorage, Normalizedfarm } from 'utils/TypesAndInterfaces/Farm'
import { farmsPopupsContext } from '../FarmsPopups/FarmsPopups.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'

const QuestionLinkBlock = () => (
  <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
    <Icon id="question" />
  </a>
)

const LogoHeaderContent = ({
  firstToken,
  secondToken,
  name,
  subtitle,
}: {
  name: string
  firstToken: FarmStorage[number]['lpToken1']
  secondToken: FarmStorage[number]['lpToken2']
  subtitle?: string
}) => (
  <div className="farm-card-header">
    <CoinsIcons firstAssetLogoSrc={firstToken.thumbnailUri} secondAssetLogoSrc={secondToken.thumbnailUri} />
    <div className="farm-card-section">
      <h3>{name}</h3>
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  </div>
)

const ApyBlock = ({ valueAPR, triggerCalculatorModal }: { valueAPR: number; triggerCalculatorModal: () => void }) => (
  <div className="farm-info">
    <h3>APY</h3>
    <div className="btn-info">
      <var>
        <CommaNumber value={valueAPR} endingText="%" useAccurateParsing />
      </var>
      <button onClick={triggerCalculatorModal} className="calc-button">
        <Icon id="calculator" />
      </button>
    </div>
  </div>
)

const TotalLiquidityBlock = ({ totalLiquidity }: { totalLiquidity: number }) => (
  <div className="farm-info">
    <h3>Total Liquidity</h3>
    <var>
      <CommaNumber value={totalLiquidity} beginningText="$" />
    </var>
  </div>
)

const EarnBlock = () => (
  <div className="farm-info">
    <h3>Earn</h3>
    <var>sMVK+Fees</var>
  </div>
)

const StakedBlock = ({
  myFarmStakedBalance,
  token1Symbol,
  token2Symbol,
}: {
  token1Symbol: string
  token2Symbol: string
  myFarmStakedBalance: number
}) => (
  <div className="farm-info">
    <h3>{`${token1Symbol} - ${token2Symbol}`} LP staked</h3>
    <var>
      <CommaNumber value={Number(myFarmStakedBalance)} />
    </var>
  </div>
)

const LinksBlock = ({
  farmAddress,
  token1Symbol,
  token2Symbol,
}: {
  farmAddress: string
  token1Symbol: string
  token2Symbol: string
}) => (
  <div className="links-block">
    {/* TODO: get link for this */}
    <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
      Get {`${token1Symbol} - ${token2Symbol}`} <Icon id="send" />
    </a>
    <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farmAddress}`}>
      View Contract <Icon id="send" />
    </a>
  </div>
)

const HarvestBlock = ({ userReward = 0, harvestRewards }: { userReward?: number; harvestRewards: () => void }) => (
  <FarmHarvestStyled className="farm-harvest">
    <div className="farm-info">
      <h3>sMVK Earned</h3>
      <CommaNumber className="value" value={userReward} />
    </div>
    <Button kind="actionPrimary" text={'Harvest'} onClick={harvestRewards} disabled={userReward === 0} />
  </FarmHarvestStyled>
)

const FarmingBlock = ({
  triggerDepositModal,
  triggerWithdrawModal,
  token1Symbol,
  token2Symbol,
  accountPhk,
  farmAccounts,
  isFarmLive,
}: {
  triggerDepositModal: () => void
  triggerWithdrawModal: () => void
  isFarmLive: boolean
  token1Symbol: string
  token2Symbol: string
  accountPhk: string | null
  farmAccounts: FarmStorage[number]['farmAccounts']
}) => {
  const depositedAmount = farmAccounts.find(({ user: { address } }) => accountPhk === address)?.deposited_amount ?? 0
  return (
    <>
      {!accountPhk ? (
        <div className="start-farming">
          <h3>Start Farming</h3>
          <ConnectWalletBtn />
        </div>
      ) : (
        <FarmStakeStyled className="farm-stake">
          <StakedBlock myFarmStakedBalance={depositedAmount} token1Symbol={token1Symbol} token2Symbol={token2Symbol} />
          {isFarmLive ? (
            <div className="circle-buttons">
              <Button text="Stake LP" kind="actionPrimary" icon="in" onClick={triggerDepositModal} />
              <Button text="Unstake LP" kind="actionSecondary" icon="out" onClick={triggerWithdrawModal} />
            </div>
          ) : null}
        </FarmStakeStyled>
      )}
    </>
  )
}

type FarmCardViewProps = {
  farm: Normalizedfarm
  apyValue: number
  accountPkh: string | null
  isOpenedCard: boolean
  userReward?: number
  triggerWithdrawModal: () => void
  triggerDepositModal: () => void
  harvestRewards: () => void
  expandBlockCallback: () => void
  triggerCalculatorModal: () => void
}

const VerticalFarmComponent = ({
  farm,
  isOpenedCard,
  userReward,
  apyValue,
  accountPkh,
  triggerWithdrawModal,
  triggerDepositModal,
  harvestRewards,
  expandBlockCallback,
  triggerCalculatorModal,
}: FarmCardViewProps) => {
  return (
    <FarmCardStyled key={farm.address} className={`accordion vertical ${isOpenedCard ? 'opened' : ''}`}>
      <QuestionLinkBlock />
      <LogoHeaderContent
        name={
          farm.lpToken1.symbol && farm.lpToken2.symbol ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}` : farm.name
        }
        subtitle={farm.farmContract?.creator?.alias}
        firstToken={farm.lpToken1}
        secondToken={farm.lpToken2}
      />
      <div className="farm-info-vertical">
        <ApyBlock valueAPR={apyValue} triggerCalculatorModal={triggerCalculatorModal} />
        <EarnBlock />
        <TotalLiquidityBlock totalLiquidity={farm.lpBalance} />
      </div>
      <div className="vertical-harvest">
        <HarvestBlock userReward={userReward} harvestRewards={harvestRewards} />
      </div>
      <div className="vertical-harvest">
        <FarmingBlock
          isFarmLive={farm.isLive}
          token1Symbol={farm.lpToken1.symbol}
          token2Symbol={farm.lpToken2.symbol}
          accountPhk={accountPkh}
          farmAccounts={farm.farmAccounts}
          triggerDepositModal={triggerDepositModal}
          triggerWithdrawModal={triggerWithdrawModal}
        />
      </div>

      <Expand
        className="vertical-expand prevent-hover"
        onClickCallback={expandBlockCallback}
        isExpandedByDefault={isOpenedCard}
      >
        <LinksBlock
          farmAddress={farm.address}
          token1Symbol={farm.lpToken1.symbol}
          token2Symbol={farm.lpToken2.symbol}
        />
      </Expand>
    </FarmCardStyled>
  )
}

const HorisontalFarmComponent = ({
  farm,
  isOpenedCard,
  userReward,
  apyValue,
  accountPkh,
  triggerWithdrawModal,
  triggerDepositModal,
  harvestRewards,
  expandBlockCallback,
  triggerCalculatorModal,
}: FarmCardViewProps) => {
  return (
    <FarmCardStyled className={`horizontal ${isOpenedCard ? 'opened' : ''}`}>
      <QuestionLinkBlock />
      <Expand
        onClickCallback={expandBlockCallback}
        className="prevent-hover"
        isExpandedByDefault={isOpenedCard}
        header={
          <>
            <LogoHeaderContent
              name={
                farm.lpToken1.symbol && farm.lpToken2.symbol
                  ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`
                  : farm.name
              }
              subtitle={farm.farmContract?.creator?.alias}
              firstToken={farm.lpToken1}
              secondToken={farm.lpToken2}
            />
            <EarnBlock />
            <ApyBlock valueAPR={apyValue} triggerCalculatorModal={triggerCalculatorModal} />
            <TotalLiquidityBlock totalLiquidity={farm.lpBalance} />
          </>
        }
      >
        <div className="horizontal-expand">
          <HarvestBlock harvestRewards={harvestRewards} userReward={userReward} />
          <FarmingBlock
            isFarmLive={farm.isLive}
            accountPhk={accountPkh}
            token1Symbol={farm.lpToken1.symbol}
            token2Symbol={farm.lpToken2.symbol}
            farmAccounts={farm.farmAccounts}
            triggerDepositModal={triggerDepositModal}
            triggerWithdrawModal={triggerWithdrawModal}
          />
          <LinksBlock
            farmAddress={farm.address}
            token1Symbol={farm.lpToken1.symbol}
            token2Symbol={farm.lpToken2.symbol}
          />
        </div>
      </Expand>
    </FarmCardStyled>
  )
}

type FarmCardProps = {
  farm: FarmStorage[number]
  currentRewardPerBlock: number
  variant: FarmsViewVariantType
  depositAmount: number
  isOpenedCard: boolean
  expandCallback: () => void
}

export const FarmCard = ({ farm, variant, isOpenedCard, currentRewardPerBlock, expandCallback }: FarmCardProps) => {
  const dispatch = useDispatch()
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { availableFarmRewards } = useUserRewards()
  const { openDepositFarmPopup, openRoiCalculatorPopup, openWithdrawFarmPopup } = useContext(farmsPopupsContext)

  const valueAPY = calculateAPY(farm.currentRewardPerBlock, farm.lpBalance)
  const userReward = availableFarmRewards[farm.address]

  const harvestRewards = () => {
    dispatch(harvest(farm.address, tokensMetadata))
  }

  const openROI = () =>
    openRoiCalculatorPopup({
      selectedFarmAddress: farm.address,
    })

  const openDeposit = () =>
    openDepositFarmPopup({
      selectedFarmAddress: farm.address,
    })

  const openWithdraw = () =>
    openWithdrawFarmPopup({
      selectedFarmAddress: farm.address,
    })

  return variant === 'vertical' ? (
    <VerticalFarmComponent
      accountPkh={userAddress}
      farm={farm}
      isOpenedCard={isOpenedCard}
      userReward={userReward}
      apyValue={valueAPY}
      expandBlockCallback={expandCallback}
      triggerCalculatorModal={openROI}
      triggerDepositModal={openDeposit}
      triggerWithdrawModal={openWithdraw}
      harvestRewards={harvestRewards}
    />
  ) : (
    <HorisontalFarmComponent
      accountPkh={userAddress}
      farm={farm}
      isOpenedCard={isOpenedCard}
      userReward={userReward}
      apyValue={valueAPY}
      expandBlockCallback={expandCallback}
      triggerCalculatorModal={openROI}
      triggerDepositModal={openDeposit}
      triggerWithdrawModal={openWithdraw}
      harvestRewards={harvestRewards}
    />
  )
}
