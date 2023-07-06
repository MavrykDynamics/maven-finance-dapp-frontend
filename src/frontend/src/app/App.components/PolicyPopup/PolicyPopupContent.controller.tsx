import React, { useState } from 'react'

import { BUTTON_PRIMARY, BUTTON_WIDE } from '../Button/Button.constants'
import NewButton from 'app/App.components/Button/NewButton'
import Icon from '../Icon/Icon.view'

import { PopupContainerWrapper } from '../popup/PopupMain.style'
import Checkbox from '../Checkbox/Checkbox.view'

export const PolicyPopupContent = ({ proccedPolicy }: { proccedPolicy: () => void }) => {
  const [checkbox, setCheckbox] = useState(false)

  return (
    <PopupContainerWrapper onClick={(e: React.MouseEvent) => e.stopPropagation()} className="policy">
      <h1>Welcome to the Mavryk Finance Public Beta!</h1>

      <p>
        TLDR: We’re super excited to present Mavryk Finance’s Beta v0.1!! This stage is to showcase our platform to the
        community and for public testing & feedback. Please keep in mind we are undergoing continuous internal testing &
        bug fixes, and we are constantly updating the Dapp. That being said, we would love for you explore, test, and
        become familiar with Mavryk Finance, and everything our team is building. We only ask that you reach out to us
        about any issues you may have ASAP via the form on the site, and are more than happy to hop on a call and
        discuss them. If you love it, we would greatly appreciate your support in the community, tweets on Twitter, and
        wider social media.
      </p>

      <h3>Incoming Updates & Fixes:</h3>

      <ol>
        <li>Improved UI/UX for Satellite operators.</li>
        <li>Live data updates (more exact data at all times).</li>
        <li>Advanced Permissions for Vaults.</li>
        <li>Transaction Estimation & Improved Error Handling.</li>
      </ol>

      <h3>Known UI/UX Issues & Bugs:</h3>

      <ol>
        <li>Slow data display updates.</li>
      </ol>

      <Checkbox id="policy" onChangeHandler={() => setCheckbox(!checkbox)} checked={checkbox}>
        <span>I understand that Mavryk Finance is in Beta and want to have some fun.</span>
      </Checkbox>

      <div className="procced-btn">
        <NewButton kind={BUTTON_PRIMARY} form={BUTTON_WIDE} disabled={!checkbox} onClick={proccedPolicy}>
          <Icon id="doubleCheckmark" /> Proceed
        </NewButton>
      </div>
    </PopupContainerWrapper>
  )
}
