import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { FeedsListItem, FeedsOraclesCardStyled, DataFeedListItemTextTruncated } from 'pages/DataFeeds/DataFeeds.styles'
import { ORACLE_STATUSES_MAPPER } from 'providers/SatellitesProvider/satellites.const'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

import { SatelliteOracleStatusComponent } from '../../Satellites/listItem/SatelliteCard.style'

export const OracleCard = ({ oracle }: { oracle: SatelliteRecordType }) => {
  const { tezos: xtzExchangeRate = 0, mvk: mvkExchangeRate = 0 } = useSelector(
    (state: State) => state.tokens.tokensPrices,
  )

  const smvkReward = oracle.oracleRecords.reduce<number>((acc, { sMVKReward }) => (acc += sMVKReward), 0)
  const xtzReward = oracle.oracleRecords.reduce<number>((acc, { XTZReward }) => (acc += XTZReward), 0)

  return (
    <Link to={`/satellites/satellite-details/${oracle.address}`}>
      <FeedsOraclesCardStyled>
        <FeedsListItem>
          <h5>Oracle</h5>
          <DataFeedListItemTextTruncated>{oracle.name}</DataFeedListItemTextTruncated>
        </FeedsListItem>

        <FeedsListItem>
          <h5>sMVK Rewards</h5>
          <var>
            <CommaNumber showDecimal value={smvkReward} />
          </var>
          <div className="converted">
            <CommaNumber showDecimal beginningText="$" value={smvkReward * mvkExchangeRate} />
          </div>
        </FeedsListItem>

        <FeedsListItem>
          <h5>Recouped Gas Fees</h5>
          <var>
            <CommaNumber showDecimal value={xtzReward} />
          </var>
          {xtzExchangeRate ? (
            <div className="converted">
              <CommaNumber showDecimal beginningText="$" value={xtzReward * xtzExchangeRate} />
            </div>
          ) : null}
        </FeedsListItem>

        <FeedsListItem>
          <h5>Accuracy</h5>
          <var>
            <CommaNumber showDecimal value={Math.max(0, Math.min(oracle.accuracy, 100))} endingText="%" />
          </var>
        </FeedsListItem>

        <FeedsListItem className="vertical-center">
          <SatelliteOracleStatusComponent statusType={oracle.oracleStatus}>
            {ORACLE_STATUSES_MAPPER[oracle.oracleStatus]}
          </SatelliteOracleStatusComponent>
        </FeedsListItem>

        <FeedsListItem className="open-full vertical-center">
          <svg>
            <use xlinkHref="/icons/sprites.svg#openLink" />
          </svg>
        </FeedsListItem>
      </FeedsOraclesCardStyled>
    </Link>
  )
}
