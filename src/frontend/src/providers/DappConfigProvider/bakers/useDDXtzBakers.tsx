import { useMemo, useState } from 'react'

import { useDappConfigContext } from '../dappConfig.provider'

import { DropDownItemType } from 'app/App.components/DropDown/NewDropdown'

import { DropDownJsxChild } from 'app/App.components/DropDown/DropDown.style'
import { ImageWithPlug } from 'app/App.components/Icon/ImageWithPlug'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'

export type DropDownXTZBakerType = DropDownItemType & {
  bakerName: string
  bakerAddress: string
  bakerYield: number
  bakerFreeSpace: number
}

const useXtzBakersForDD = (useMavrykBakers = true) => {
  const { xtzBakers } = useDappConfigContext()

  const [choosenBakerAddress, setChoosenBakerAddress] = useState<string | undefined>()

  // select baker for an xtz collateral, used only when we selected one collateral XTZ
  const bakers = useMemo(() => {
    if (!xtzBakers) return {}

    const { otherBakers = [], dao, mavrykDynamics } = xtzBakers

    let firstNonDisabledBakerAddress: null | string = null

    const allBakers = [...otherBakers, ...(useMavrykBakers ? [dao, mavrykDynamics] : [])].reduce<
      Record<string, DropDownXTZBakerType>
    >((acc, { name, fee, logo, address, yield: bakerYield, freespace, isDisabled }) => {
      if (!firstNonDisabledBakerAddress && !isDisabled) firstNonDisabledBakerAddress = address
      acc[address] = {
        bakerName: name,
        id: address,
        bakerAddress: address,
        bakerYield,
        bakerFreeSpace: freespace,
        disabled: isDisabled,
        content: (
          <DropDownJsxChild>
            <div className="flex-row with-image">
              <ImageWithPlug imageLink={logo} alt={`${name} icon`} /> {name}
            </div>
            <div className="baker-fee">
              <CommaNumber value={fee} endingText="%" />
            </div>
          </DropDownJsxChild>
        ),
      }

      return acc
    }, {})

    if (!choosenBakerAddress && firstNonDisabledBakerAddress) {
      allBakers[firstNonDisabledBakerAddress].disabled = true
      setChoosenBakerAddress(firstNonDisabledBakerAddress)
    }

    return allBakers
  }, [choosenBakerAddress, xtzBakers, useMavrykBakers])

  return {
    choosenBakerAddress,
    choosenBaker: choosenBakerAddress ? bakers[choosenBakerAddress] : null,
    setChoosenBaker: (bakerAddress: string) => setChoosenBakerAddress(bakerAddress),
    bakers: Object.values(bakers),
    bakersRecord: bakers,
  }
}

export default useXtzBakersForDD
