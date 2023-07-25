import { useLockBodyScroll } from 'react-use'
import { useEffect } from 'react'

// consts
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'

// helpers
import { getTokenDataByAddress, isTezosAsset } from 'providers/TokensProvider/helpers/tokens.utils'

// styles
import { LoansModalBase } from '../Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// types
import { CreateVaultPopupDataType } from 'providers/LoansProvider/helpers/LoansModals.types'

// providers
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import useXtzBakersForDD from 'providers/DappConfigProvider/bakers/useDDXtzBakers'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'

// hooks
import { useUserVaultsNames } from 'providers/VaultsProvider/hooks/useVaultsNames'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

import { CreateVaultModalProvider } from './CreateVaultModal.provider'
import { useCreateVaultContext } from './helpers/createVaultModalContext'
import {
  ADD_COLLATERAL_SCREEN_ID,
  BORROW_SCREEN_ID,
  CONFIRMATION_SCREEN_ID,
  INITIAL_SCREEN_ID,
  screenDescriptions,
  screenTitles,
} from './helpers/createNewVault.consts'
import { CreateVaultScreen } from './modalScreens/CreateVaultScreen'
import { AddCollateralScreen } from './modalScreens/AddCollateralScreen'
import { ConfirmationScreen } from './modalScreens/ConfirmationScreen'

type CreateNewModalProps = {
  closePopup: () => void
  show: boolean
  data: CreateVaultPopupDataType
}

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVaultConsumer = ({ closePopup, show, data }: CreateNewModalProps) => {
  //   internal create vault context
  const { screenToShow, resetCreateVaultModalState } = useCreateVaultContext()

  useLockBodyScroll(show)

  useEffect(() => {
    if (!show) {
      resetCreateVaultModalState()
    }
  }, [show])

  const { avaliableLiquidity = 0, marketTokenAddress, setCreatedVaultAddress } = data ?? {}
  if (!data) return null

  const titleText = screenTitles[screenToShow]
  const descrText = screenDescriptions[screenToShow]

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />

          <H2Title>{titleText}</H2Title>
          <div
            className="modalDescr"
            // style={{
            //   ...(shownScreen === 'addCollateral' ? { marginBottom: '50px' } : {}),
            // }}
          >
            {descrText}
          </div>

          {screenToShow === INITIAL_SCREEN_ID && (
            <CreateVaultScreen
              marketTokenAddress={marketTokenAddress}
              setCreatedVaultAddress={setCreatedVaultAddress}
            />
          )}
          {screenToShow === ADD_COLLATERAL_SCREEN_ID && <AddCollateralScreen />}
          {/* {screenToShow === BORROW_SCREEN_ID && <BorrowScreen />} */}
          {screenToShow === CONFIRMATION_SCREEN_ID && (
            <ConfirmationScreen avaliableLiquidity={avaliableLiquidity} closePopup={closePopup} />
          )}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

export const CreateNewVault = (props: CreateNewModalProps) => {
  return (
    <CreateVaultModalProvider>
      <CreateNewVaultConsumer {...props} />
    </CreateVaultModalProvider>
  )
}
