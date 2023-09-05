import styled from 'styled-components'

// consts
import { BUTTON_PRIMARY, BUTTON_WIDE, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'

// view
import Button from 'app/App.components/Button/NewButton'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import ConnectWalletBtn from 'app/App.components/ConnectWallet/ConnectWalletBtn'
import Icon from 'app/App.components/Icon/Icon.view'
import { Card } from 'styles'

// types
import { FarmsTokenMetadataType } from 'providers/TokensProvider/tokens.provider.types'
import { useFarmsPopupsContext } from 'providers/FarmsProvider/farmsPopups.provider'

const FarmCardActionsStyled = styled(Card)`
  padding: 20px;

  display: flex;

  .start-farming {
    display: flex;
    align-items: center;

    flex: auto;

    .connectWalletWrapper {
      max-width: 330px;
      width: 100%;
    }

    h3 {
      color: ${({ theme }) => theme.regularText};
      font-size: 22px;
      font-weight: 600;
    }
  }
`

export const FarmCardActions = ({
  isFarmLive,
  isMFarm,
  isVertical = false,
  farmToken,
  userAddress,
  farmAddress,
  userDepositedAmount,
}: {
  isFarmLive: boolean
  isMFarm: boolean
  isVertical?: boolean
  farmToken: FarmsTokenMetadataType
  userAddress: string | null
  farmAddress: string
  userDepositedAmount: number
}) => {
  const { openDepositFarmPopup, openWithdrawFarmPopup } = useFarmsPopupsContext()

  const tokenName = isMFarm
    ? farmToken.symbol
    : `${farmToken.farmLpData.token0?.symbol}-${farmToken.farmLpData.token1?.symbol}`

  const openDepositModal = () =>
    openDepositFarmPopup({
      selectedFarmAddress: farmAddress,
    })

  const openWithdrawModal = () =>
    openWithdrawFarmPopup({
      selectedFarmAddress: farmAddress,
    })

  return (
    <FarmCardActionsStyled className="farm-actions">
      {userAddress ? (
        <>
          <div className="info">
            <div className="name">{tokenName} LP staked</div>
            <CommaNumber className="value" value={userDepositedAmount} />
          </div>

          {isVertical ? (
            <>
              <div className="farmActionWrapper">
                <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={openDepositModal} disabled={!isFarmLive}>
                  <Icon id="in" /> Stake LP
                </Button>
              </div>

              <div className="farmActionWrapper">
                <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={openWithdrawModal} disabled={!isFarmLive}>
                  <Icon id="out" /> UnStake LP
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="farmActionWrapper">
                <Button kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={openWithdrawModal} disabled={!isFarmLive}>
                  <Icon id="out" /> UnStake LP
                </Button>
              </div>

              <div className="farmActionWrapper">
                <Button kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={openDepositModal} disabled={!isFarmLive}>
                  <Icon id="in" /> Stake LP
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="start-farming">
          {isVertical ? (
            <h3>Start Farming</h3>
          ) : (
            <div className="info">
              <div className="name">{tokenName} LP staked</div>
              <CommaNumber className="value" value={userDepositedAmount} />
            </div>
          )}
          <div className="connectWalletWrapper">
            <ConnectWalletBtn isWide />
          </div>
        </div>
      )}
    </FarmCardActionsStyled>
  )
}
