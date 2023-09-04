import { Link } from 'react-router-dom'

import { useSatelliteStatuses } from 'providers/SatellitesProvider/hooks/useSatelliteStatus'
import { useTokensContext } from 'providers/TokensProvider/tokens.provider'

import { Feed } from 'providers/DataFeedsProvider/dataFeeds.provider.types'
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'

import { MVK_TOKEN_SYMBOL } from 'utils/constants'
import { XTZ_TOKEN_SYMBOL } from 'utils/constants'
import { SATELLITE_ORACLE_STATUSES } from 'providers/SatellitesProvider/satellites.const'

import { calcPersent, convertNumberForClient } from 'utils/calcFunctions'

import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { FeedsListItem, FeedsOraclesCardStyled, DataFeedListItemTextTruncated } from 'pages/DataFeeds/DataFeeds.styles'
import { SatelliteOracleStatusComponent } from '../../Satellites/listItem/SatelliteCard.style'

export const OracleCard = ({ oracle, feed }: { oracle: SatelliteRecordType; feed: Feed }) => {
  const { tokensPrices } = useTokensContext()
  const { oracleStatus } = useSatelliteStatuses(oracle)

  const { address, name, XTZRewards, sMVKRewards } = oracle
  const { decimals, amount, address: feedAddress } = feed

  const xtzExchangeRate = tokensPrices[XTZ_TOKEN_SYMBOL] ?? 0
  const mvkExchangeRate = tokensPrices[MVK_TOKEN_SYMBOL] ?? 0

  const oracleLastPredictedPrice = oracle.participatedFeeds[feedAddress].lastPredictedPrice

  // TODO: check whether calcs for accuracy valid
  const feedAccuracy = oracleLastPredictedPrice
    ? calcPersent(convertNumberForClient({ number: oracleLastPredictedPrice, grade: decimals }), amount)
    : 0

  return (
    <Link to={`/satellites/satellite-details/${address}`} className="full-opacity">
      <FeedsOraclesCardStyled>
        <FeedsListItem>
          <h5>Oracle</h5>
          <DataFeedListItemTextTruncated>{name}</DataFeedListItemTextTruncated>
        </FeedsListItem>

        <FeedsListItem>
          <h5>sMVK Rewards</h5>
          <var>
            <CommaNumber showDecimal value={sMVKRewards} />
          </var>
          <div className="converted">
            <CommaNumber showDecimal beginningText="$" value={sMVKRewards * mvkExchangeRate} />
          </div>
        </FeedsListItem>

        <FeedsListItem>
          <h5>Recouped Gas Fees</h5>
          <var>
            <CommaNumber showDecimal value={XTZRewards} />
          </var>
          {xtzExchangeRate ? (
            <div className="converted">
              <CommaNumber showDecimal beginningText="$" value={XTZRewards * xtzExchangeRate} />
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
          <SatelliteOracleStatusComponent statusType={oracleStatus}>
            {SATELLITE_ORACLE_STATUSES[oracleStatus]}
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
