import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { DoormanList, DoormanStatsHeader, DoormanStatsStyled } from './DoormanStats.style'
import { Tooltip } from 'app/App.components/Tooltip/Tooltip'
import Icon from 'app/App.components/Icon/Icon.view'
import CustomLink from 'app/App.components/CustomLink/CustomLink'

// helpers
import { PRIMARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'

type DoormanStatsPropsType = {
  mvkExchangeRate: number
  maximumTotalSupply: number
  totalStakedMvk: number
  totalSupply: number
  doormanAddress: string | null
  mvkTokenAddress: string | null
}

export const DoormanStats = ({
  mvkExchangeRate,
  maximumTotalSupply,
  totalStakedMvk,
  totalSupply,
  doormanAddress,
  mvkTokenAddress,
}: DoormanStatsPropsType) => {
  const mli = calcMLI(totalSupply, totalStakedMvk)
  const fee = calcExitFee(totalSupply, totalStakedMvk)
  const marketCapValue = mvkExchangeRate ? mvkExchangeRate * totalSupply : 0

  return (
    <DoormanStatsStyled>
      <DoormanStatsHeader>Key MVN Metrics</DoormanStatsHeader>
      <DoormanList>
        <div>
          <h4>
            MVN Price
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>
                Once launched, the price will be taken from the exchange MVN is listed on, not from our Oracle price
                feeds.
              </Tooltip.Content>
            </Tooltip>
          </h4>
          <var>
            <CommaNumber value={mvkExchangeRate} beginningText={'$'} />
          </var>
        </div>

        <div>
          <h4>MVN Token Address</h4>
          <var className="click-address">
            <TzAddress type={PRIMARY_TZ_ADDRESS_COLOR} tzAddress={mvkTokenAddress} hasIcon />
          </var>
        </div>

        <div>
          <h4>
            Doorman Address
            <Tooltip>
              <Tooltip.Trigger className="ml-5">
                <Icon id="info" />
              </Tooltip.Trigger>
              <Tooltip.Content>
                <>
                  The Doorman contract controls the staking mechanism for MVN. Handles all actions connected to it and
                  interacts with the other relevant contracts.{' '}
                  <a
                    href="https://docs.mavryk.finance/smart-contracts/smart-contracts-overview/doorman-contract"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read more.
                  </a>
                </>
              </Tooltip.Content>
            </Tooltip>
          </h4>
          <var className="click-address">
            <TzAddress type={PRIMARY_TZ_ADDRESS_COLOR} tzAddress={doormanAddress} hasIcon />
          </var>
        </div>

        <div>
          <h4>
            MVN Loyalty Index
            <CustomLink to="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking">
              <Tooltip>
                <Tooltip.Trigger>
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  The Maven Loyalty Index is a metric that balances MVN & sMVN. The more MVN is staked v.s. MVN, the
                  higher the MLI, and the lower the exit fee is. The less MVN staked v.s. MVN, the lower the MLI, and
                  the exit fee will rise. Click to read more.
                </Tooltip.Content>
              </Tooltip>
            </CustomLink>
          </h4>
          <var>
            <CommaNumber value={mli} />
          </var>
        </div>

        <div>
          <h4>
            Exit Fee
            <CustomLink to="https://docs.mavryk.finance/mavryk-finance/staking/benefits-and-fees-of-staking#exit-fee">
              <Tooltip>
                <Tooltip.Trigger>
                  <Icon id="info" />
                </Tooltip.Trigger>
                <Tooltip.Content>
                  The Exit Fee is dynamic, adjusts according to the MLI, and may modified by governance vote. Exit fees
                  are paid directly to sMVN stakeholders for remaining active participants in securing the network.
                  Click to read more.
                </Tooltip.Content>
              </Tooltip>
            </CustomLink>
          </h4>
          <var>
            <CommaNumber value={fee} endingText={'%'} />
          </var>
        </div>

        <div>
          <h4>Total Staked MVN</h4>
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
