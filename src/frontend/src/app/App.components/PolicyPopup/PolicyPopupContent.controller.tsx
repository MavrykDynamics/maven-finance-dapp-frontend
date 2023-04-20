import React, { useState } from 'react'

import { BUTTON_PRIMARY, BUTTON_WIDE } from '../Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../Icon/Icon.view'

import { PopupContainerWrapper } from '../SettingsPopup/SettingsPopup.style'
import Checkbox from '../Checkbox/Checkbox.view'

export const PolicyPopupContent = ({ proccedPolicy }: { proccedPolicy: () => void }) => {
  const [checkbox, setCheckbox] = useState(false)

  return (
    <PopupContainerWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()} className="policy">
      <h1>Welcome to the Mavryk Finance Alpha</h1>

      <p>
        TLDR: This is the Mavryk Finance Alpha v0.1. It is undergoing heavy internal testing and bug fixes and we are
        constantly updating the DAPP. That being said, would love for you to take a look at what we have been building.
        We only ask that you reach out to us about any issues you may have ASAP. More than have to hop on a call and
        discuss them.
      </p>

      <h3>Known Major Bugs & UX/UI issues:</h3>

      <ol>
        <li>
          Random wallet issue where loader after triggering transactions lasts for 1 sec and data doesn't update. Please
          refresh a few seconds later
        </li>
        <li>Slow data updates</li>
        <li>
          Governance Proposal Submission - bit buggy and doesn’t always update data straight after TX action + lock
          proposal btn disabled
        </li>
      </ol>

      <h3>Incoming Updates & Fixes:</h3>

      <ol>
        <li>Governance voting system refactor and fixes</li>
        <li>Governance Proposal Submission fixes</li>
        <li>MVK VS. sMVK graph - new data query to show correct data - w/updated indexer</li>
      </ol>

      <div className="checkbox">
        <Checkbox id="show_dropped" onChangeHandler={() => setCheckbox(!checkbox)} checked={checkbox} />I understand
        that Mavryk is in Alpha and want to have some fun
      </div>

      <div className="procced-btn">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={!checkbox} onClick={proccedPolicy}>
          <Icon id="doubleCheckmark" /> Procced
        </NewButton>
      </div>
    </PopupContainerWrapper>
  )
}
