import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { calcExitFee, calcMLI } from '../../../utils/calcFunctions'

// components
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { DoormanList, DoormanStatsHeader, DoormanStatsStyled } from './DoormanStats.style'

export const DoormanStats = () => {
  const {
    exchangeRate,
    mvkTokenStorage: { maximumTotalSupply },
  } = useSelector((state: State) => state.mvkToken)
  const { doormanAddress, mvkTokenAddress } = useSelector((state: State) => state.contractAddresses)
  const { totalStakedMvk = 0 } = useSelector((state: State) => state.doorman)

  const mli = calcMLI(maximumTotalSupply, totalStakedMvk)
  const fee = calcExitFee(maximumTotalSupply, totalStakedMvk)
  const marketCapValue = exchangeRate ? exchangeRate * maximumTotalSupply : 0

  return (
    <DoormanStatsStyled>
      <DoormanStatsHeader>Key MVK Metrics</DoormanStatsHeader>
      <DoormanList>
        <div>
          <h4>
            MVK Price
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>
          </h4>
          <var>
            <CommaNumber value={exchangeRate} beginningText={'$'} />
          </var>
        </div>

        {mvkTokenAddress?.address ? (
          <div>
            <h4>MVK Token Address</h4>
            <var className="click-address">
              <TzAddress type="blue" tzAddress={mvkTokenAddress?.address} hasIcon={true} />
            </var>
          </div>
        ) : null}

        {doormanAddress?.address ? (
          <div>
            <h4>Doorman Address</h4>
            <var className="click-address">
              <TzAddress type="blue" tzAddress={doormanAddress?.address} hasIcon={true} />
            </var>
          </div>
        ) : null}

        <div>
          <h4>
            MVK Loyalty Index
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
            </a>
          </h4>
          <var>
            <CommaNumber value={mli} endingText={' '} />
          </var>
        </div>

        <div>
          <h4>
            Exit Fee
            <a
              href="https://mavryk.finance/litepaper#converting-vmvk-back-to-mvk-exit-fees"
              target="_blank"
              rel="noreferrer"
            >
              <Icon id="question" />
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
            <CommaNumber value={maximumTotalSupply} endingText={'MVK'} />
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
