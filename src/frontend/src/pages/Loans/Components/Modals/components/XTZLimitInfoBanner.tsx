import React from 'react'
import { Info } from 'app/App.components/Info/Info.view'

type SpacesType = 'mb-10' | 'mb-20' | 'mb-30' | 'mt-10' | 'mt-20' | 'mt-30' | ' '

type OnlySpacesType<S> = S extends '' ? unknown : S extends `${SpacesType}${infer Tail}` ? OnlySpacesType<Tail> : never

type XTZLimitInfoBannerProps<S extends string> = {
  show: boolean
  spaces?: S & OnlySpacesType<S>
}

export function XTZLimitInfoBanner<S extends string>({ show = false, spaces }: XTZLimitInfoBannerProps<S>) {
  const cl = spaces ? spaces : ''
  return show ? (
    <div className={`${cl}`}>
      <Info
        text="We have reduced the amount of XTZ to be deposited in order to cover the gas and transaction fees."
        type="info"
      />
    </div>
  ) : null
}
