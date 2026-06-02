import { Link } from 'react-router'

import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { Feed } from 'providers/DataFeedsProvider/dataFeeds.provider.types'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

import { MVN_TOKEN_SYMBOL, MVRK_TOKEN_SYMBOL } from 'utils/constants'
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'

import { calcPercent, convertNumberForClient } from 'utils/calcFunctions'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { DataFeedListItemTextTruncated, FeedsListItem, FeedsOraclesCardStyled } from 'pages/DataFeeds/DataFeeds.styles'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import { getStatusColorBasedOnOracleType } from 'providers/SatellitesProvider/helpers/satellites.utils'
import { SatelliteOracleStatusComponent } from 'pages/Satellites/listItem/SatelliteCard.style'

export const OracleCard = ({ oracle, feed }: { oracle: SatelliteRecordType; feed: Feed }) => {
  const { tokensPrices } = useTokensContext()
  const { oracleStatus } = useSatelliteStatuses(oracle, feed.address)

  const { address, name, participatedFeeds } = oracle
  const { decimals, amount, address: feedAddress } = feed
  const oracleFeedRewards = participatedFeeds[feedAddress]

  const xtzExchangeRate = tokensPrices[MVRK_TOKEN_SYMBOL] ?? 0
  const mvnExchangeRate = tokensPrices[MVN_TOKEN_SYMBOL] ?? 0

  const oracleLastPredictedPrice = oracle.participatedFeeds[feedAddress].lastPredictedPrice

  // TODO: check whether calcs for accuracy valid
  const feedAccuracy = oracleLastPredictedPrice
    ? calcPercent(
        convertNumberForClient({
          number: oracleLastPredictedPrice,
          grade: decimals,
        }),
        amount,
      )
    : 0

  return (
    <Link to={`/satellites/satellite-details/${address}`} className="full-opacity">
      <FeedsOraclesCardStyled>
        <FeedsListItem>
          <h5>Oracle</h5>
          <DataFeedListItemTextTruncated>{name}</DataFeedListItemTextTruncated>
        </FeedsListItem>

        <FeedsListItem>
          <h5>sMVN Rewards</h5>
          <var>
            <CommaNumber showDecimal value={oracleFeedRewards?.sMVNReward ?? 0} />
          </var>
          <div className="converted">
            <CommaNumber showDecimal beginningText="$" value={(oracleFeedRewards?.sMVNReward ?? 0) * mvnExchangeRate} />
          </div>
        </FeedsListItem>

        <FeedsListItem>
          <h5>Recouped Gas Fees</h5>
          <var>
            <CommaNumber showDecimal value={oracleFeedRewards?.XTZReward ?? 0} />
          </var>
          {xtzExchangeRate ? (
            <div className="converted">
              <CommaNumber
                showDecimal
                beginningText="$"
                value={(oracleFeedRewards?.XTZReward ?? 0) * xtzExchangeRate}
              />
            </div>
          ) : null}
        </FeedsListItem>

        <FeedsListItem>
          <h5>Accuracy</h5>
          <var>
            <CommaNumber showDecimal value={feedAccuracy} endingText="%" />
          </var>
        </FeedsListItem>

        <FeedsListItem className="vertical-center">
          <SatelliteOracleStatusComponent>
            <StatusFlag
              status={getStatusColorBasedOnOracleType(oracleStatus)}
              text={SATELLITE_ORACLE_STATUSES[oracleStatus]}
            />
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
