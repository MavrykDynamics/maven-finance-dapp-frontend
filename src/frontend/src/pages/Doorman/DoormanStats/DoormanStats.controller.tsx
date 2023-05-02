import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { DoormanList, DoormanStatsHeader, DoormanStatsStyled } from './DoormanStats.style'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

type DoormanStatsPropsType = {
  MVK_exchangeRate: number
  maximumTotalSupply: number
  totalStakedMvk: number
  totalSupply: number
  doormanAddress: string
  mvkTokenAddress: string
}

export const DoormanStats = ({
  MVK_exchangeRate,
  maximumTotalSupply,
  totalStakedMvk,
  totalSupply,
  doormanAddress,
  mvkTokenAddress,
}: DoormanStatsPropsType) => {
  const mli = calcMLI(totalSupply, totalStakedMvk)
  const fee = calcExitFee(totalSupply, totalStakedMvk)
  const marketCapValue = MVK_exchangeRate ? MVK_exchangeRate * totalSupply : 0

  return (
    <DoormanStatsStyled>
      <DoormanStatsHeader>Key MVK Metrics</DoormanStatsHeader>
      <DoormanList>
        <div>
          <h4>
            MVK Price
            <CustomTooltip
              text="Once launched, the price will be taken from the exchange MVK is listed on, not from our Oracle price feeds."
              iconId={'info'}
            />
          </h4>
          <var>
            <CommaNumber value={MVK_exchangeRate} beginningText={'$'} />
          </var>
        </div>

        <div>
          <h4>MVK Token Address</h4>
          <var className="click-address">
            <TzAddress type="blue" tzAddress={mvkTokenAddress} hasIcon />
          </var>
        </div>

        <div>
          <h4>
            Doorman Address{' '}
            <CustomTooltip
              text={
                <>
                  The Doorman contract controls the staking mechanism for MVK. Handles all actions connected to it and
                  interacts with the other relevant contracts.{' '}
                  <a
                    href="https://mavryk.finance/litepaper#mvk-and-smvk-doorman-module"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read more.
                  </a>{' '}
                </>
              }
              iconId="info"
            />
          </h4>
          <var className="click-address">
            <TzAddress type="blue" tzAddress={doormanAddress} hasIcon />
          </var>
        </div>

        <div>
          <h4>
            MVK Loyalty Index
            <a
              href="https://mavryk.finance/litepaper#converting-smvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
              className="full-opacity"
            >
              <CustomTooltip
                text="The Mavryk Loyalty Index is a metric that balances MVK & sMVK. The more MVK is staked v.s. MVK, the higher the MLI, and the lower the exit fee is. The less MVK staked v.s. MVK, the lower the MLI, and the exit fee will rise. Click here to read more."
                iconId={'info'}
              />
            </a>
          </h4>
          <var>
            <CommaNumber value={mli} />
          </var>
        </div>

        <div>
          <h4>
            Exit Fee
            <a
              href="https://mavryk.finance/litepaper#converting-smvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
              className="full-opacity"
            >
              <CustomTooltip
                text="The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit fees are paid directly to sMVK stakeholders for remaining active participants in securing the network. Click to read more."
                iconId={'info'}
              />
            </a>
          </h4>
          <var>
            <CommaNumber value={fee} endingText={'%'} />
          </var>
        </div>

        <div>
          <h4>Total Staked MVK</h4>
          <var>
            <CommaNumber value={totalStakedMvk} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Total Circulating</h4>
          <var>
            <CommaNumber value={totalSupply} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Max Supply</h4>
          <var>
            <CommaNumber value={maximumTotalSupply} endingText={'MVK'} />
          </var>
        </div>

        <div>
          <h4>Market Cap</h4>
          <var>
            <CommaNumber value={marketCapValue} endingText={'USD'} />
          </var>
        </div>

        {/* <div>
          <h4>Total supply</h4>
          <var>
            <CommaNumber value={maximumTotalSupply}  endingText={'MVK'} />
          </var>
        </div> */}
      </DoormanList>
    </DoormanStatsStyled>
  )
}
