import { useDispatch, useSelector } from 'react-redux'

import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { UnregisterSatelliteModalBase } from '../BecomeSatellite.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { State } from 'reducers'
import { unregisterSatellite } from 'providers/SatellitesProvider/actions/satellites.actions'
import { checkIfActionSuccess } from 'providers/DappConfigProvider/helpers/dappAction.helpers'
import { UNREGISTER_SATELLITE_ACTION } from 'providers/SatellitesProvider/satellites.const'
import { TOASTER_ACTIONS_TEXTS } from 'app/App.components/Toaster/texts/toasterActions.texts'
import { toggleActionCompletion, toggleActionFullScreenLoader } from 'app/App.components/Loader/Loader.action'
import { TOASTER_UPDATE_DATA_AFTER_ACTION_DATA } from 'providers/ToasterProvider/toaster.provider.const'
import { sleep } from 'utils/api/sleep'
import { isContractErrorPayload } from 'errors/helpers/walletError.helper'
import { unknownToError } from 'errors/error'
import { TezosWalletErrorPayload } from 'errors/error.type'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

export const UnregisterPopup = ({
  show,
  closePopup,
  satellite,
}: {
  show: boolean
  closePopup: () => void
  satellite: SatelliteRecordType
}) => {
  const dispatch = useDispatch()

  const {
    setAction,
    contractAddresses: { delegationAddress },
  } = useDappConfigContext()
  const { bug, info, loading } = useToasterContext()
  const { userAddress } = useUserContext()

  const handleUnregisterSatellite = async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return
    }
    if (!delegationAddress) {
      bug('Wrong delegation address')
      return
    }

    try {
      const actionResult = await unregisterSatellite(userAddress, delegationAddress, closePopup)
      if (checkIfActionSuccess(actionResult)) {
        const { operation } = actionResult
        dispatch(toggleActionFullScreenLoader(true))
        dispatch(toggleActionCompletion(true))
        info(
          TOASTER_ACTIONS_TEXTS[UNREGISTER_SATELLITE_ACTION]['start']['message'],
          TOASTER_ACTIONS_TEXTS[UNREGISTER_SATELLITE_ACTION]['start']['title'],
        )
        await sleep(5000)
        // show toaster loader after 5000ms after operation started
        const toasterId = loading(
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.message,
          TOASTER_UPDATE_DATA_AFTER_ACTION_DATA.title,
        )
        dispatch(toggleActionFullScreenLoader(false))
        dispatch(toggleActionCompletion(false))
        const operationConfirm = await operation.confirmation()
        const operationLvl = operationConfirm.block.header.level
        setAction({ actionName: UNREGISTER_SATELLITE_ACTION, toasterId, operationLvl })
      } else if (isContractErrorPayload(actionResult.error)) {
        const { message, description } = actionResult.error as TezosWalletErrorPayload
        bug(description, message)
      } else {
        throw new Error(actionResult.error?.message)
      }
    } catch (e) {
      setAction(null)
      const parsedError = unknownToError(e)
      bug(parsedError.message)
    }
  }

  const { delegatorCount = 0, totalDelegatedAmount = 0 } = satellite ?? {}

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} widthSize={586}>
        <button className="close-modal" onClick={closePopup} />
        <UnregisterSatelliteModalBase>
          <H2Title>Unregister Satellite</H2Title>

          <div className="descr">
            Please note, you are unregistering as a satellite from the Mavryk Finance network. You will no longer be
            able to participate in governance through voting and will have to delegate to a different satellite to take
            part in the ecosystem.
          </div>

          {delegatorCount > 0 ? (
            <>
              <div className="descr-big">Your delegate status:</div>
              <div className="card">
                <div className="col">
                  <div className="name">Total Delegated sMVK</div>
                  <CommaNumber value={totalDelegatedAmount} className="value" />
                </div>
                <div className="col">
                  <div className="name"># Delegators</div>
                  <CommaNumber value={delegatorCount} className="value" />
                </div>
              </div>
              <div className="descr">
                Before unregistering, please consider posting in the Mavryk Finance discord and telegram that you are
                unregistering as a Satellite so your delegators will be aware that they need to re-delegate to an active
                Satellite.
              </div>
              <div className="icons">
                <a href="https://discord.com/invite/7VXPR4gkT6" target="_blank" rel="noreferrer">
                  <Icon id="discord" className="discord" />
                </a>
                <a href="https://t.me/Mavryk_Finance" target="_blank" rel="noreferrer">
                  <Icon id="telegram" className="telegram" />
                </a>
              </div>
              <div className="descr-big">Are you sure you wish to unregister as a satellite?</div>
            </>
          ) : null}

          <div className="buttons">
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" /> Cancel
            </NewButton>

            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={handleUnregisterSatellite}>
              <Icon id="doubleCheckmark" />
              Confirm
            </NewButton>
          </div>
        </UnregisterSatelliteModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
