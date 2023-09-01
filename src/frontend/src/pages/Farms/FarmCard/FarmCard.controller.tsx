import { useContext } from 'react'
import { useDispatch } from 'react-redux'

// view
import { VerticalFarmCard } from './VerticalFarmCard'
import { HorizontalFarmCard } from './HorizonralFarmCard'

// utils
import { calculateAPY } from '../Farms.helpers'
import { checkWhetherTokenIsFarmToken } from 'providers/TokensProvider/helpers/tokens.utils'
import { harvest } from '../Farms.actions'

// consts
import { farmsPopupsContext } from '../FarmsPopups/FarmsPopups.provider'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserRewards } from 'providers/UserProvider/hooks/useUserRewards'
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'

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

  return (
    <HorizontalFarmCard
      farm={farm}
      farmToken={farmToken}
      isCardOpened={isOpenedCard}
      harvestRewards={harvestRewards}
      expandCallback={expandCallback}
    />
  )
}

// ----------- COMMON COMPONENTS -----------
