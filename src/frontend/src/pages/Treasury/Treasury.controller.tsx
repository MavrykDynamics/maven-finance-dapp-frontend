import { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'
import { TreasuryType } from 'utils/TypesAndInterfaces/Treasury'

// actions, helpers
import { getTreasuryStorage } from './Treasury.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'
import { getTreasuryTVL, reduceTreasuryAssets } from './helpers/treasury.utils'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import TreasuryView from './Treasury.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DDItemId, DropDown, DropDownItemType } from '../../app/App.components/DropDown/NewDropdown'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

type TreasuryDDType = DropDownItemType & { treasury: TreasuryType[number] }

export const Treasury = () => {
  const dispatch = useDispatch()

  const { tokensMetadata, tokensPrices } = useTokensContext()
  const { treasuryStorage, isLoaded } = useSelector((state: State) => state.treasury)
  const {
    treasuryFactoryAddress: { address: treasuryFactoryAddress },
  } = useSelector((state: State) => state.contractAddresses)

  const { isLoading } = useDataLoader(async (isDepsChanged) => {
    try {
      if (!isLoaded || isDepsChanged) {
        await dispatch(getTreasuryStorage())
      }
    } catch (error) {}
  }, [])

  const ddItems = treasuryStorage.map<TreasuryDDType>((treasury) => ({
    content: treasury.name,
    treasury,
    id: treasury.address,
  }))

  const [chosenDdItem, setChosenDdItem] = useState<TreasuryDDType | undefined>()
  const handleOnClickDropdownItem = (e: DDItemId) => {
    const chosenItem = ddItems.find((item) => item.id === e)
    setChosenDdItem(chosenItem)
  }

  const assetsBalances = useMemo(() => Object.values(reduceTreasuryAssets(treasuryStorage)), [treasuryStorage])

  const globalTreasuryTVL = useMemo(
    () => treasuryStorage.reduce((acc, treasury) => (acc += getTreasuryTVL(treasury, tokensMetadata, tokensPrices)), 0),
    [treasuryStorage, tokensMetadata, tokensPrices],
  )

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
