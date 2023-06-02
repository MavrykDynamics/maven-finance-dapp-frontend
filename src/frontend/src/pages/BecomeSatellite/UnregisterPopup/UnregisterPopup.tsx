import { useDispatch } from 'react-redux'

import { unregisterAsSatellite } from '../BecomeSatellite.actions'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

import { UnregisterSatelliteModalBase } from '../BecomeSatellite.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

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
  const handleUnregisterSatellite = async () => await dispatch(unregisterAsSatellite(closePopup))

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
