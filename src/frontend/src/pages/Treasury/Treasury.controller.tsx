import { useState, useMemo, useEffect } from 'react'
import { TreasuryType } from 'providers/TreasuryProvider/helpers/treasury.types'

// actions, helpers
import { getTreasuryTVL, reduceTreasuryAssets } from 'providers/TreasuryProvider/helpers/treasury.utils'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'
import { useTreasuryContext } from 'providers/TreasuryProvider/treasury.provider'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import TreasuryView from './Treasury.view'
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { DDItemId, DropDown, DropDownItemType } from '../../app/App.components/DropDown/NewDropdown'

// styles
import { Page } from 'styles'
import { TreasuryActiveStyle, TreasurySelectStyle } from './Treasury.style'
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'

// consts
import { DEFAULT_TREASURY_SUBS, TREASURY_STORAGE_QUERY } from 'providers/TreasuryProvider/helpers/treasury.consts'

type TreasuryDDType = DropDownItemType & { treasury: TreasuryType[number] }

export const Treasury = () => {
  const { tokensMetadata, tokensPrices } = useTokensContext()
  const {
    contractAddresses: { treasuryFactoryAddress },
  } = useDappConfigContext()
  const { isLoading, changeTreasurySubscriptionsList, treasuryAddresses, treasuryMapper } = useTreasuryContext()

  useEffect(() => {
    changeTreasurySubscriptionsList({
      [TREASURY_STORAGE_QUERY]: true,
    })

    return () => {
      changeTreasurySubscriptionsList(DEFAULT_TREASURY_SUBS)
    }
  }, [])

  const ddItems = useMemo(
    () =>
      treasuryAddresses.map<TreasuryDDType>((address) => {
        const treasury = treasuryMapper[address]

        return {
          content: treasury.name,
          treasury,
          id: treasury.address,
        }
      }),
    [treasuryAddresses, treasuryMapper],
  )

  const [chosenDdItem, setChosenDdItem] = useState<TreasuryDDType | undefined>()
  const handleOnClickDropdownItem = (e: DDItemId) => {
    const chosenItem = ddItems.find((item) => item.id === e)
    setChosenDdItem(chosenItem)
  }

  const assetsBalances = useMemo(
    () => Object.values(reduceTreasuryAssets(treasuryAddresses, treasuryMapper)),
    [treasuryAddresses, treasuryMapper],
  )

  const globalTreasuryTVL = useMemo(
    () =>
      treasuryAddresses.reduce(
        (acc, address) => (acc += getTreasuryTVL(treasuryMapper[address], tokensMetadata, tokensPrices)),
        0,
      ),
    [treasuryAddresses, treasuryMapper, tokensMetadata, tokensPrices],
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
