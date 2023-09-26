import { useCallback, useMemo, useState } from 'react'

// types
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

// consts
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'
import { UNREGISTER_SATELLITE_ACTION } from 'providers/SatellitesProvider/satellites.const'

// components
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

// styles
import { UnregisterSatelliteModalBase } from '../BecomeSatellite.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// actions

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'
import { REGISTER_AGGREGATOR_ACTION } from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'
import { registerAggregator } from 'providers/SatellitesGovernanceProvider/actions/satellitesGov.actions'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'
import { BlockName } from 'pages/Dashboard/Dashboard.style'

// TODO aggregator addresses
export const aggregatorsList = [
  { content: 'Aggregator 1', id: '1' },
  { content: 'Aggregator 2', id: '1' },
]

export const AddToAggregatorPopup = ({
  show,
  closePopup,
  satellite,
}: {
  show: boolean
  closePopup: () => void
  satellite: SatelliteRecordType | null
}) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { governanceSatelliteAddress },
  } = useDappConfigContext()

  const [chosenDdItem, setChosenDdItem] = useState(aggregatorsList[0])

  const handleOnClickDropdownItem = (itemId: DDItemId) => {
    const chosenItem = aggregatorsList.find((item) => item.id === itemId)
    if (chosenItem) {
      setChosenDdItem(chosenItem)
    }
  }

  const selectedAggregatorAddress = ''

  //   registerAggregator action ---------------------------------------------------------------------------
  const registerAggregatorActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceSatelliteAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!selectedAggregatorAddress) {
      bug('Wrong selected data')
      return null
    }

    return await registerAggregator(governanceSatelliteAddress, selectedAggregatorAddress, userAddress)
  }, [bug, governanceSatelliteAddress, selectedAggregatorAddress, userAddress])

  const registerAggregatorContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REGISTER_AGGREGATOR_ACTION,
      actionFn: registerAggregatorActionFn,
    }),
    [registerAggregatorActionFn],
  )

  const { action: registerAggregatorAction } = useContractAction(registerAggregatorContratActionProps)

  return (
    <PopupContainer onClick={closePopup} show={show}>
      <PopupContainerWrapper onClick={(e) => e.stopPropagation()} widthSize={586}>
        <button className="close-modal" onClick={closePopup} />
        <UnregisterSatelliteModalBase>
          <H2Title>Register to a Aggregator Pair</H2Title>
          <div className="descr">
            Text that explains that they have to be voted in to starting to sign for each aggregator
          </div>
          <div className="ml-11 mb-8">Select Aggregator</div>
          <DropDown
            placeholder="Choose aggregator"
            activeItem={chosenDdItem}
            items={aggregatorsList}
            clickItem={handleOnClickDropdownItem}
          />
          <div className="buttons">
            <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} onClick={registerAggregatorAction}>
              <Icon id="doubleCheckmark" />
              Register
            </NewButton>
          </div>
        </UnregisterSatelliteModalBase>
      </PopupContainerWrapper>
    </PopupContainer>
  )
}
