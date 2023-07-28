import { useLockBodyScroll } from 'react-use'
import { useEffect, useMemo } from 'react'

// styles
import { LoansModalBase } from '../Modals.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// types
import { CreateVaultModalProvider } from './context/CreateVaultModal.provider'
import { useCreateVaultContext } from './context/createVaultModalContext'
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
import { CreateVaultModalStepper } from './components/CreateVaultModalStepper'
import { VaultModalStepperWrapper } from './createNewVault.style'
import { BorrowScreen } from './modalScreens/BorrowScreen'
import classNames from 'classnames'
import { CreateNewModalProps } from './helpers/createNewVault.types'
import { useVaultsContext } from 'providers/VaultsProvider/vaults.provider'
import { DEFAULT_LOANS_ACTIVE_SUBS, LOANS_MARKETS_DATA } from 'providers/LoansProvider/helpers/loans.const'
import { DEFAULT_VAULTS_ACTIVE_SUBS, VAULTS_ALL, VAULTS_DATA } from 'providers/VaultsProvider/vaults.provider.consts'

// TODO: design: https://www.figma.com/file/wvMt99sibDTpWMiwgP6xCy/Mavryk?node-id=17480%3A229353&t=Sx2aEpp3ifrGxBtQ-0
export const CreateNewVaultConsumer = () => {
  //   internal create vault context
  const { screenToShow, resetCreateVaultModalState, closePopup, show, data } = useCreateVaultContext()

  const { changeVaultsSubscriptionsList } = useVaultsContext()

  useLockBodyScroll(show)

  // useEffect(() => {
  //   changeVaultsSubscriptionsList({
  //     [VAULTS_DATA]: VAULTS_ALL,
  //   })

  //   return () => {
  //     changeVaultsSubscriptionsList(DEFAULT_VAULTS_ACTIVE_SUBS)
  //   }
  // }, [])

  useEffect(() => {
    if (!show) {
      resetCreateVaultModalState()
    }
  }, [show])

  const { marketTokenAddress, setCreatedVaultAddress } = data ?? {}
  const activeStepperIndex = useMemo(
    () => stepperItems.findIndex((item) => item === stepperItemsObj[screenToShow]),
    [screenToShow],
  )

  if (!data) return null

  const titleText =
    screenToShow !== BORROW_SCREEN_ID ? screenTitles[screenToShow] : `${screenTitles[screenToShow]} ${123}`
  const descrText = screenDescriptions[screenToShow]

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper
        onClick={(e) => e.stopPropagation()}
        className={classNames('loans', 'loans-overflow', 'scroll-block')}
      >
        <LoansModalBase>
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
          {screenToShow === CONFIRMATION_SCREEN_ID ? <ConfirmationScreen /> : null}
        </LoansModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}

export const CreateNewVault = (props: CreateNewModalProps) => {
  return (
    <CreateVaultModalProvider {...props}>
      <CreateNewVaultConsumer />
    </CreateVaultModalProvider>
  )
}
