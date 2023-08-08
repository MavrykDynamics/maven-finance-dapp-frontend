import React from 'react'
import { Info } from 'app/App.components/Info/Info.view'

type XTZLimitInfoBannerProps = {
  show?: boolean
  spaces?: string
}

export const XTZLimitInfoBanner = ({ show = false, spaces = '' }: XTZLimitInfoBannerProps) => {
  return show ? (
    <div className={`${spaces}`}>
      <Info
        text="We have reduced the amount of XTZ to be deposited in order to cover the gas and transaction fees."
        type="info"
      />
    </div>
  ) : null
}
