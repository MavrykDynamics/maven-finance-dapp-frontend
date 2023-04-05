import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'

// actions
import { fillTreasuryStorage } from './Treasury.actions'
import { reduceTreasuryAssets } from './Treasury.helpers'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import TreasuryView from './Treasury.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DDItemId, DropDown, DropDownItemType } from '../../app/App.components/DropDown/NewDropdown'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

type TreasuryDDType = DropDownItemType & { treasury: TreasuryType }

export const Treasury = () => {
  const dispatch = useDispatch()
  const { treasuryStorage, treasuryFactoryAddress, isLoaded } = useSelector((state: State) => state.treasury)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isLoaded || isDepsChanged) {
        await dispatch(fillTreasuryStorage())
      }
    } catch (error) {}
  }, [])

  const ddItems = useMemo(
    () =>
      treasuryStorage.map<TreasuryDDType>((treasury) => ({
        content: treasury.name,
        treasury,
        id: treasury.address,
      })),
    [treasuryStorage],
  )

  const [chosenDdItem, setChosenDdItem] = useState<TreasuryDDType | undefined>()
  const handleOnClickDropdownItem = (e: DDItemId) => {
    const chosenItem = ddItems.find((item) => item.id === e)
    setChosenDdItem(chosenItem)
  }

  const { assetsBalances, globalTreasuryTVL } = useMemo(() => reduceTreasuryAssets(treasuryStorage), [treasuryStorage])

  const globalTreasury = {
    name: 'Global Treasury TVL',
    balances: assetsBalances,
    address: '',
    treasuryTVL: globalTreasuryTVL,
  }

  return (
    <Page>
      <PageHeader page={'treasury'} />
      {isLoading ? (
        <DataLoaderWrapper>
          <ClockLoader width={150} height={150} />
          <div className="text">Loading treasuries</div>
        </DataLoaderWrapper>
      ) : (
        <>
          <TreasuryView treasury={globalTreasury} isGlobal factoryAddress={treasuryFactoryAddress} />
          <TreasuryActiveStyle>
            <TreasurySelectStyle isSelectedTreasury={Boolean(chosenDdItem)}>
              <h2>Active Treasuries</h2>
              <DropDown
                placeholder={ddItems.length === 0 ? 'No Treasuries currently active' : 'Choose treasury'}
                activeItem={chosenDdItem}
                items={ddItems}
                clickItem={handleOnClickDropdownItem}
                disabled={ddItems.length === 0}
              />
            </TreasurySelectStyle>
            {chosenDdItem?.treasury ? <TreasuryView treasury={chosenDdItem.treasury} /> : null}
          </TreasuryActiveStyle>
        </>
      )}
    </Page>
  )
}
