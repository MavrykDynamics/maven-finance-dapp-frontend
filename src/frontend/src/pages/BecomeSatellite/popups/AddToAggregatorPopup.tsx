import React, { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'

// consts
import { REGISTER_AGGREGATOR_ACTION } from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'
import { BUTTON_SECONDARY, BUTTON_PRIMARY, BUTTON_WIDE } from 'app/App.components/Button/Button.constants'

// components
import NewButton from 'app/App.components/Button/NewButton'
import Icon from 'app/App.components/Icon/Icon.view'
import { DDItemId, DropDown } from 'app/App.components/DropDown/NewDropdown'

// styles
import { SatelliteUpperTextBlock, UnregisterSatelliteModalBase } from '../BecomeSatellite.style'
import { PopupContainer, PopupContainerWrapper } from 'app/App.components/popup/PopupMain.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'

// providers
import { useUserContext } from 'providers/UserProvider/user.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// actions
import { registerAggregator } from 'providers/SatellitesGovernanceProvider/actions/satellitesGov.actions'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// queries
import { useDataFeedsContext } from 'providers/DataFeedsProvider/dataFeeds.provider'

const AddToAggregatorPopupBase = ({ show, closePopup }: { show: boolean; closePopup: () => void }) => {
  const { bug } = useToasterContext()
  const { userAddress } = useUserContext()
  const {
    contractAddresses: { governanceSatelliteAddress },
  } = useDappConfigContext()
  const { feedsAddresses, isLoading: loading } = useDataFeedsContext()
  console.log(feedsAddresses)

  const aggregatorsList = useMemo(
    () => feedsAddresses.map((address, idx) => ({ content: address, id: idx })) ?? [],
    [feedsAddresses],
  )

  const [selectedAggregator, setSelectedAggregator] = useState(aggregatorsList[0])

  const handleOnClickDropdownItem = (itemId: DDItemId) => {
    const chosenItem = aggregatorsList.find((item) => item.id === itemId)
    if (chosenItem) {
      setSelectedAggregator(chosenItem)
    }
  }

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

    if (!selectedAggregator.content) {
      bug('Wrong selected aggregator address')
      return null
    }

    return await registerAggregator(governanceSatelliteAddress, selectedAggregator.content, userAddress)
  }, [bug, governanceSatelliteAddress, selectedAggregator, userAddress])

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
          <SatelliteUpperTextBlock>Select Aggregator</SatelliteUpperTextBlock>
          <DropDown
            placeholder="Choose aggregator"
            activeItem={selectedAggregator}
            items={aggregatorsList}
            clickItem={handleOnClickDropdownItem}
            disabled={loading || !aggregatorsList.length}
          />
          <div className="buttons">
            <NewButton kind={BUTTON_SECONDARY} form={BUTTON_WIDE} onClick={closePopup}>
              <Icon id="navigation-menu_close" /> Cancel
            </NewButton>
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

export const AddToAggregatorPopup = React.memo(AddToAggregatorPopupBase)
