import React from 'react'
import { createContext } from 'react'
import {
  DEFAULT_FARMS_POPUPS_STATE,
  FarmDepositPopupDataType,
  FarmsPopupsContextStateType,
  FarmWithdrawPopupDataType,
  RoiCalculatorPopupDataType,
} from '../Farms.const'
import RoiCalculator from '../RoiCalculator/RoiCalculator.controller'
import { FarmDepositModal } from './FarmDepositModal.controller'
import { FarmWithdrawModal } from './FarmWithdrawModal.controller'

export const farmsPopupsContext = createContext<FarmsPopupsContextStateType>(undefined!)

export default class FarmsPopupsProvider extends React.Component<{}, FarmsPopupsContextStateType> {
  constructor(props: {}) {
    super(props)

    this.state = {
      ...DEFAULT_FARMS_POPUPS_STATE,
      openRoiCalculatorPopup: this.openRoiCalculatorPopup,
      closeRoiCalculatorPopup: this.closeRoiCalculatorPopup,

      openDepositFarmPopup: this.openDepositFarmPopup,
      closeDepositFarmPopup: this.closeDepositFarmPopup,

      openWithdrawFarmPopup: this.openWithdrawFarmPopup,
      closeWithdrawFarmPopup: this.closeWithdrawFarmPopup,
    }
  }

  openRoiCalculatorPopup = (popupData: RoiCalculatorPopupDataType) => {
    this.setState({
      ...this.state,
      roiPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeRoiCalculatorPopup = () => {
    this.setState({
      ...this.state,
      roiPopup: {
        ...this.state.roiPopup,
        showModal: false,
      },
    })
  }

  openDepositFarmPopup = (popupData: FarmDepositPopupDataType) => {
    this.setState({
      ...this.state,
      depositPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeDepositFarmPopup = () => {
    this.setState({
      ...this.state,
      depositPopup: {
        ...this.state.depositPopup,
        showModal: false,
      },
    })
  }

  openWithdrawFarmPopup = (popupData: FarmWithdrawPopupDataType) => {
    this.setState({
      ...this.state,
      withdrawPopup: {
        showModal: true,
        data: popupData,
      },
    })
  }

  closeWithdrawFarmPopup = () => {
    this.setState({
      ...this.state,
      withdrawPopup: {
        ...this.state.withdrawPopup,
        showModal: false,
      },
    })
  }

  render() {
    const { roiPopup, depositPopup, withdrawPopup } = this.state
    const { closeDepositFarmPopup, closeRoiCalculatorPopup, closeWithdrawFarmPopup } = this.state

    return (
      <farmsPopupsContext.Provider value={this.state}>
        <RoiCalculator closeHandler={closeRoiCalculatorPopup} data={roiPopup.data} show={roiPopup.showModal} />
        <FarmDepositModal closeHandler={closeDepositFarmPopup} data={depositPopup.data} show={depositPopup.showModal} />
        <FarmWithdrawModal
          closeHandler={closeWithdrawFarmPopup}
          data={withdrawPopup.data}
          show={withdrawPopup.showModal}
        />
        {this.props.children}
      </farmsPopupsContext.Provider>
    )
  }
}
