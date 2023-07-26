import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo } from 'react'

// styles
import { LoansModalBase } from '../Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// types
import { CreateVaultPopupDataType } from 'providers/LoansProvider/helpers/LoansModals.types'

import { CreateVaultModalProvider } from './CreateVaultModal.provider'
import { useCreateVaultContext } from './helpers/createVaultModalContext'
import {
  ADD_COLLATERAL_SCREEN_ID,
  BORROW_SCREEN_ID,
  CONFIRMATION_SCREEN_ID,
  INITIAL_SCREEN_ID,
  screenDescriptions,
  screenTitles,
  stepperItems,
  stepperItemsObj,
} from './helpers/createNewVault.consts'
import { CreateVaultScreen } from './modalScreens/CreateVaultScreen'
import { AddCollateralScreen } from './modalScreens/AddCollateralScreen'
import { ConfirmationScreen } from './modalScreens/ConfirmationScreen'
import { CreateVaultModalStepper } from './CreateVaultModalStepper'
import { VaultModalStepperWrapper } from './createNewVault.style'
import { BorrowScreen } from './modalScreens/BorrowScreen'

type CreateNewModalProps = {
  closePopup: () => void
  show: boolean
  data: CreateVaultPopupDataType
}

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVaultConsumer = ({ closePopup, show, data }: CreateNewModalProps) => {
  //   internal create vault context
  const { screenToShow, resetCreateVaultModalState, updateScreenToShow } = useCreateVaultContext()

  useLockBodyScroll(show)

  useEffect(() => {
    if (!show) {
      resetCreateVaultModalState()
    }
  }, [show])

  const { avaliableLiquidity = 0, marketTokenAddress, setCreatedVaultAddress } = data ?? {}
  const activeStepperIndex = useMemo(
    () => stepperItems.findIndex((item) => item === stepperItemsObj[screenToShow]),
    [screenToShow],
  )

  if (!data) return null

  const titleText = screenTitles[screenToShow]
  const descrText = screenDescriptions[screenToShow]

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} className="loans">
        <LoansModalBase>
          <button onClick={closePopup} className="close-modal" />
          {/* <button onClick={() => updateScreenToShow('addCollateral')}> Add collateral</button>
          <button onClick={() => updateScreenToShow('borrow')}> Borrow</button>
          <button onClick={() => updateScreenToShow('confirmation')}> Confirmation</button>
          <button onClick={() => updateScreenToShow('createVault')}> Create vault</button> */}

          <VaultModalStepperWrapper>
            <CreateVaultModalStepper items={stepperItems} activeIndex={activeStepperIndex} />
          </VaultModalStepperWrapper>
          <H2Title>{titleText}</H2Title>
          <div className="modalDescr">{descrText}</div>

          {screenToShow === INITIAL_SCREEN_ID ? (
            <CreateVaultScreen
              marketTokenAddress={marketTokenAddress}
              setCreatedVaultAddress={setCreatedVaultAddress}
            />
          ) : null}
          {screenToShow === ADD_COLLATERAL_SCREEN_ID ? <AddCollateralScreen /> : null}
          {screenToShow === BORROW_SCREEN_ID && <BorrowScreen />}
          {screenToShow === CONFIRMATION_SCREEN_ID ? (
            <ConfirmationScreen avaliableLiquidity={avaliableLiquidity} closePopup={closePopup} />
          ) : null}
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
