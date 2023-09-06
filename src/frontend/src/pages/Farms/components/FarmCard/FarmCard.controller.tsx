import { useCallback, useMemo } from 'react'

// view
import { VerticalFarmCard } from './VerticalFarmCard'
import { HorizontalFarmCard } from './HorizonralFarmCard'

// utils
import { checkWhetherTokenIsFarmToken, getTokenDataByAddress } from 'providers/TokensProvider/helpers/tokens.utils'

// hooks
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { FarmRecordType } from 'providers/FarmsProvider/farms.provider.types'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { harvestRewards } from 'providers/FarmsProvider/actions/farms.actions'
import { HARVEST_FARM_REWARDS_ACTION } from 'providers/FarmsProvider/helpers/farms.const'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

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
  isOpenedCard: boolean
  expandCallback: () => void
}

export const FarmCard = ({ farm, isVertical, isOpenedCard, expandCallback }: FarmCardProps) => {
  const { tokensMetadata } = useTokensContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  // harvest rewards action ---------------------------
  const harvestRewardsAction = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    return await harvestRewards(farm.address)
  }, [farm.address, userAddress])

  const harvestRewardsContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: HARVEST_FARM_REWARDS_ACTION,
      actionFn: harvestRewardsAction,
    }),
    [harvestRewardsAction],
  )

  const { action: handleHarvestRewards } = useContractAction(harvestRewardsContractActionProps)

  const farmToken = getTokenDataByAddress({ tokensMetadata, tokenAddress: farm?.liquidityTokenAddress })
  if (!farmToken || !checkWhetherTokenIsFarmToken(farmToken)) return null

  if (isVertical) {
    return (
      <VerticalFarmCard
        farm={farm}
        farmToken={farmToken}
        isCardOpened={isOpenedCard}
        harvestRewards={handleHarvestRewards}
        expandCallback={expandCallback}
      />
    )
  }

  return (
    <HorizontalFarmCard
      farm={farm}
      farmToken={farmToken}
      isCardOpened={isOpenedCard}
      harvestRewards={handleHarvestRewards}
      expandCallback={expandCallback}
    />
  )
}
