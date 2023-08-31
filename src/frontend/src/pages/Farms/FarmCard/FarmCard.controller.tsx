import { useContext } from 'react'
import { useDispatch } from 'react-redux'

// view
import Expand from '../../../app/App.components/Expand/Expand.view'
import ConnectWalletBtn from '../../../app/App.components/ConnectWallet/ConnectWalletBtn'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'
import { harvest } from '../Farms.actions'
import Icon from '../../../app/App.components/Icon/Icon.view'
import CoinsIcons from '../../../app/App.components/Icon/CoinsIcons.view'

// helpers
import { calculateAPY } from '../Farms.helpers'

// styles
import {
  FarmCardActionsStyled,
  FarmCardHarvestStyled,
  FarmCardHeaderStyled,
  FarmCardStyled,
  FarmHarvestStyled,
  FarmStakeStyled,
} from './FarmCard.style'
import { FarmStorage } from 'utils/TypesAndInterfaces/Farm'
import { farmsPopupsContext } from '../FarmsPopups/FarmsPopups.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'
import { VerticalFarmCard } from './VerticalFarmCard'
import { HorizontalFarmCard } from './HorizonralFarmCard'
import { FarmsTokenMetadataType, TokensContext } from 'providers/TokensProvider/tokens.provider.types'
import { checkWhetherTokenIsFarmToken } from 'providers/TokensProvider/helpers/tokens.utils'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
import { FarmCardCoinIcons } from './cardParts/FarmCardCoinIcons'
import Button from 'app/App.components/Button/NewButton'
import { BUTTON_PRIMARY, BUTTON_SECONDARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// const QuestionLinkBlock = () => (
//   <a className="info-link" href="https://mavryk.finance/litepaper#yield-farming" target="_blank" rel="noreferrer">
//     <Icon id="question" />
//   </a>
// )

// const LogoHeaderContent = ({
//   firstToken,
//   secondToken,
//   name,
//   subtitle,
// }: {
//   name: string
//   firstToken: FarmStorage[number]['lpToken1']
//   secondToken: FarmStorage[number]['lpToken2']
//   subtitle?: string
// }) => (
//   <div className="farm-card-header">
//     <CoinsIcons firstAssetLogoSrc={firstToken.thumbnailUri} secondAssetLogoSrc={secondToken.thumbnailUri} />
//     <div className="farm-card-section">
//       <h3>{name}</h3>
//       {subtitle && <div className="subtitle">{subtitle}</div>}
//     </div>
//   </div>
// )

// const StakedBlock = ({
//   myFarmStakedBalance,
//   token1Symbol,
//   token2Symbol,
// }: {
//   token1Symbol: string
//   token2Symbol: string
//   myFarmStakedBalance: number
// }) => (
//   <div className="farm-info">
//     <h3>{`${token1Symbol} - ${token2Symbol}`} LP staked</h3>
//     <var>
//       <CommaNumber value={Number(myFarmStakedBalance)} />
//     </var>
//   </div>
// )

// const LinksBlock = ({
//   farmAddress,
//   token1Symbol,
//   token2Symbol,
// }: {
//   farmAddress: string
//   token1Symbol: string
//   token2Symbol: string
// }) => (
//   <div className="links-block">
//     {/* TODO: get link for this */}
//     <a target="_blank" rel="noreferrer" href="https://mavryk.finance/">
//       Get {`${token1Symbol} - ${token2Symbol}`} <Icon id="send" />
//     </a>
//     <a target="_blank" rel="noreferrer" href={`https://tzkt.io/${farmAddress}`}>
//       View Contract <Icon id="send" />
//     </a>
//   </div>
// )

// const FarmingBlock = ({
//   triggerDepositModal,
//   triggerWithdrawModal,
//   token1Symbol,
//   token2Symbol,
//   userAddress,
//   farmDepositors,
//   isFarmLive,
// }: {
//   triggerDepositModal: () => void
//   triggerWithdrawModal: () => void
//   isFarmLive: boolean
//   token1Symbol: string
//   token2Symbol: string
//   userAddress: string | null
//   farmDepositors: FarmRecordType['farmDepositors']
// }) => {
//   const depositedAmount = farmDepositors.find(({ address }) => userAddress === address)?.depositedAmount ?? 0
//   return (
//     <>
//       {!userAddress ? (
//         <div className="start-farming">
//           <h3>Start Farming</h3>
//           <ConnectWalletBtn />
//         </div>
//       ) : (
//         <FarmStakeStyled className="farm-stake">
//           <StakedBlock myFarmStakedBalance={depositedAmount} token1Symbol={token1Symbol} token2Symbol={token2Symbol} />
//           {isFarmLive ? (
//             <div className="circle-buttons">
//               <Button text="Stake LP" kind="actionPrimary" icon="in" onClick={triggerDepositModal} />
//               <Button text="Unstake LP" kind="actionSecondary" icon="out" onClick={triggerWithdrawModal} />
//             </div>
//           ) : null}
//         </FarmStakeStyled>
//       )}
//     </>
//   )
// }

// type FarmCardViewProps = {
//   farm: FarmRecordType
//   apyValue: number
//   userAddress: string | null
//   isOpenedCard: boolean
//   userReward?: number
//   triggerWithdrawModal: () => void
//   triggerDepositModal: () => void
//   harvestRewards: () => void
//   expandBlockCallback: () => void
//   // triggerCalculatorModal: () => void
// }

// const VerticalFarmComponent = ({
//   farm,
//   isOpenedCard,
//   userReward,
//   apyValue,
//   userAddress,
//   triggerWithdrawModal,
//   triggerDepositModal,
//   harvestRewards,
//   expandBlockCallback,
// }: // triggerCalculatorModal,
// FarmCardViewProps) => {
//   return (
//     <FarmCardStyled key={farm.address} className={`accordion vertical ${isOpenedCard ? 'opened' : ''}`}>
//       <QuestionLinkBlock />
//       <LogoHeaderContent
//         name={
//           farm.lpToken1.symbol && farm.lpToken2.symbol ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}` : farm.name
//         }
//         subtitle={farm.farmContract?.creator?.alias}
//         firstToken={farm.lpToken1}
//         secondToken={farm.lpToken2}
//       />
//       <div className="farm-info-vertical">
//         <ApyBlock valueAPR={apyValue} triggerCalculatorModal={() => {}} />
//         <EarnBlock />
//         <TotalLiquidityBlock totalLiquidity={farm.liquidityTokenBalance} />
//       </div>
//       <div className="vertical-harvest">
//         <HarvestBlock userReward={userReward} harvestRewards={harvestRewards} />
//       </div>
//       <div className="vertical-harvest">
//         <FarmingBlock
//           isFarmLive={farm.open}
//           token1Symbol={farm.lpToken1.symbol}
//           token2Symbol={farm.lpToken2.symbol}
//           userAddress={userAddress}
//           farmDepositors={farm.farmDepositors}
//           triggerDepositModal={triggerDepositModal}
//           triggerWithdrawModal={triggerWithdrawModal}
//         />
//       </div>

//       <Expand className="vertical-expand" onClickCallback={expandBlockCallback} isExpandedByDefault={isOpenedCard}>
//         <LinksBlock
//           farmAddress={farm.address}
//           token1Symbol={farm.lpToken1.symbol}
//           token2Symbol={farm.lpToken2.symbol}
//         />
//       </Expand>
//     </FarmCardStyled>
//   )
// }

// const HorisontalFarmComponent = ({
//   farm,
//   isOpenedCard,
//   userReward,
//   apyValue,
//   userAddress,
//   triggerWithdrawModal,
//   triggerDepositModal,
//   harvestRewards,
//   expandBlockCallback,
// }: // triggerCalculatorModal,
// FarmCardViewProps) => {
//   return (
//     <FarmCardStyled className={`horizontal ${isOpenedCard ? 'opened' : ''}`}>
//       <QuestionLinkBlock />
//       <Expand
//         onClickCallback={expandBlockCallback}
//         className="prevent-hover"
//         isExpandedByDefault={isOpenedCard}
//         header={
//           <>
//             <LogoHeaderContent
//               name={
//                 farm.lpToken1.symbol && farm.lpToken2.symbol
//                   ? `${farm.lpToken1.symbol} - ${farm.lpToken2.symbol}`
//                   : farm.name
//               }
//               subtitle={farm.farmContract?.creator?.alias}
//               firstToken={farm.lpToken1}
//               secondToken={farm.lpToken2}
//             />
//             <EarnBlock />
//             <ApyBlock valueAPR={apyValue} triggerCalculatorModal={() => {}} />
//             <TotalLiquidityBlock totalLiquidity={farm.liquidityTokenBalance} />
//           </>
//         }
//       >
//         <div className="horizontal-expand">
//           <HarvestBlock harvestRewards={harvestRewards} userReward={userReward} />
//           <FarmingBlock
//             isFarmLive={farm.open}
//             userAddress={userAddress}
//             token1Symbol={farm.lpToken1.symbol}
//             token2Symbol={farm.lpToken2.symbol}
//             farmDepositors={farm.farmDepositors}
//             triggerDepositModal={triggerDepositModal}
//             triggerWithdrawModal={triggerWithdrawModal}
//           />
//           <LinksBlock
//             farmAddress={farm.address}
//             token1Symbol={farm.lpToken1.symbol}
//             token2Symbol={farm.lpToken2.symbol}
//           />
//         </div>
//       </Expand>
//     </FarmCardStyled>
//   )
// }

type FarmCardProps = {
  farm: FarmRecordType
  isVertical: boolean
  depositAmount: number
  isOpenedCard: boolean
  expandCallback: () => void
}

export const FarmCard = ({ farm, isVertical, isOpenedCard, expandCallback }: FarmCardProps) => {
  const dispatch = useDispatch()
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { availableFarmRewards } = useUserRewards()
  // const { openDepositFarmPopup, openRoiCalculatorPopup, openWithdrawFarmPopup } = useContext(farmsPopupsContext)
  const { openDepositFarmPopup, openWithdrawFarmPopup } = useContext(farmsPopupsContext)

  const valueAPY = calculateAPY(farm.currentRewardPerBlock, farm.liquidityTokenBalance)
  const userReward = availableFarmRewards[farm.address]

  const farmToken = tokensMetadata[farm.liquidityTokenAddress]

  console.log({ farmToken })

  if (!checkWhetherTokenIsFarmToken(farmToken)) return null

  const harvestRewards = () => {
    dispatch(harvest(farm.address, tokensMetadata))
  }

  // const openROI = () =>
  //   openRoiCalculatorPopup({
  //     selectedFarmAddress: farm.address,
  //   })

  const openDeposit = () =>
    openDepositFarmPopup({
      selectedFarmAddress: farm.address,
    })

  const openWithdraw = () =>
    openWithdrawFarmPopup({
      selectedFarmAddress: farm.address,
    })

  // return variant === 'vertical' ? (
  //   <VerticalFarmComponent
  //     userAddress={userAddress}
  //     farm={farm}
  //     isOpenedCard={isOpenedCard}
  //     userReward={userReward}
  //     apyValue={valueAPY}
  //     expandBlockCallback={expandCallback}
  //     // triggerCalculatorModal={openROI}
  //     triggerDepositModal={openDeposit}
  //     triggerWithdrawModal={openWithdraw}
  //     harvestRewards={harvestRewards}
  //   />
  // ) : (
  //   <HorisontalFarmComponent
  //     userAddress={userAddress}
  //     farm={farm}
  //     isOpenedCard={isOpenedCard}
  //     userReward={userReward}
  //     apyValue={valueAPY}
  //     expandBlockCallback={expandCallback}
  //     // triggerCalculatorModal={openROI}
  //     triggerDepositModal={openDeposit}
  //     triggerWithdrawModal={openWithdraw}
  //     harvestRewards={harvestRewards}
  //   />
  // )

  if (isVertical) {
    return (
      <VerticalFarmCard
        farm={farm}
        farmToken={farmToken}
        isCardOpened={isOpenedCard}
        harvestRewards={harvestRewards}
        expandCallback={expandCallback}
      />
    )
  }

  return <HorizontalFarmCard />
}

// ----------- COMMON COMPONENTS -----------
export const FarmCardHarvest = ({
  userReward = 0,
  harvestRewards,
}: {
  userReward?: number
  harvestRewards: () => void
}) => (
  <FarmCardHarvestStyled className="farm-harvest">
    <div className="info">
      <div className="name">Unclaimed sMVK</div>
      <CommaNumber className="value" value={userReward} />
    </div>
    <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={harvestRewards} disabled={userReward === 0}>
      Harvest
    </Button>
  </FarmCardHarvestStyled>
)

export const FarmCardActions = ({
  triggerDepositModal,
  triggerWithdrawModal,
  isFarmLive,
  isMFarm,
  farmToken,
  userAddress,
  userDepositedAmount,
}: {
  triggerDepositModal: () => void
  triggerWithdrawModal: () => void
  isFarmLive: boolean
  isMFarm: boolean
  farmToken: FarmsTokenMetadataType
  userAddress: string | null
  userDepositedAmount: number
}) => {
  const tokenName = isMFarm
    ? farmToken.symbol
    : `${farmToken.farmLpData.token0?.symbol}-${farmToken.farmLpData.token1?.symbol}`
  return (
    <FarmCardActionsStyled className="farm-actions">
      {userAddress ? (
        <>
          <div className="info">
            <div className="name">{tokenName} LP staked</div>
            <CommaNumber className="value" value={userDepositedAmount} />
          </div>

          <div className="farmActionWrapper">
            <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={triggerDepositModal} disabled={isFarmLive}>
              <Icon id="in" /> Stake LP
            </Button>
          </div>

          <div className="farmActionWrapper">
            <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={triggerWithdrawModal} disabled={isFarmLive}>
              <Icon id="out" /> Unstake LP
            </Button>
          </div>
        </>
      ) : (
        <div className="start-farming">
          <h3>Start Farming</h3>
          <ConnectWalletBtn />
        </div>
      )}
    </FarmCardActionsStyled>
  )
}

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
