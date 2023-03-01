import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { FeedsListItem, FeedsOraclesCardStyled } from 'pages/DataFeeds/DataFeeds.styles'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'

import { SatelliteOracleStatusComponent } from '../../Satellites/listItem/SatelliteCard.style'

export const OracleCard = ({ oracle }: { oracle: SatelliteRecordType }) => {
  const { feedsLedger } = useSelector((state: State) => state.dataFeeds)
  const { tezos: { usd: xtzExchangeRate = 0 } = {}, mvk: { usd: mvkExchangeRate = 0 } = {} } = useSelector(
    (state: State) => state.tokens.tokensPrices,
  )
  const oracleStatusType = getOracleStatus(oracle, feedsLedger)

  return (
    <FeedsOraclesCardStyled>
      <FeedsListItem>
        <h5>Oracle</h5>
        <TzAddress tzAddress={oracle.address} hasIcon type={BLUE} />
      </FeedsListItem>

      <FeedsListItem>
        <h5>sMVK Rewards</h5>
        <var>
          <CommaNumber
            showDecimal
            beginningText="$"
            value={
              oracle.oracleRecords.reduce<number>((acc, { sMVKReward }) => (acc += sMVKReward), 0) * mvkExchangeRate
            }
          />
        </var>
      </FeedsListItem>

      <FeedsListItem>
        <h5>XTZ Rewards</h5>
        <var>
          {xtzExchangeRate ? (
            <CommaNumber
              showDecimal
              beginningText="$"
              value={
                oracle.oracleRecords.reduce<number>((acc, { XTZReward }) => (acc += XTZReward), 0) * xtzExchangeRate
              }
            />
          ) : (
            '-'
          )}
        </var>
      </FeedsListItem>

      <FeedsListItem>
        <h5>Accuracy</h5>
        <var>
          <CommaNumber showDecimal value={Math.max(0, Math.min(oracle.accuracy, 100))} endingText="%" />
        </var>
      </FeedsListItem>

      <FeedsListItem className="vertical-center">
        <SatelliteOracleStatusComponent statusType={oracleStatusType}>
          {ORACLE_STATUSES_MAPPER[oracleStatusType]}
        </SatelliteOracleStatusComponent>
      </FeedsListItem>

      <FeedsListItem className="open-full vertical-center">
        <Link to={`/satellites/satellite-details/${oracle.address}`}>
          <svg>
            <use xlinkHref="/icons/sprites.svg#openLink" />
          </svg>
        </Link>
      </FeedsListItem>
    </FeedsOraclesCardStyled>
  )
}
