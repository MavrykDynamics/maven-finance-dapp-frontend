import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BLUE } from 'app/App.components/TzAddress/TzAddress.constants'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { SatelliteItemStyle, SatelliteOracleStatusComponent } from './SatelliteCard.style'

export const OracleCard = ({ oracle }: { oracle: SatelliteRecord }) => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const { tezos: { usd: XTZ_USD = 0 } = {}, mvk: { usd: mvkExchangeRate = 0 } = {} } = useSelector(
    (state: State) => state.tokens.tokensPrices,
  )
  const oracleStatusType = getOracleStatus(oracle, feeds)

  return (
    <SatelliteItemStyle oracle>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
          Oracle
        </DataFeedSubTitleText>
        <TzAddress tzAddress={oracle.address} hasIcon type={BLUE} />
      </div>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
          sMVK Rewards
        </DataFeedSubTitleText>
        <var>
          <CommaNumber
            showDecimal
            beginningText="$"
            value={
              oracle.oracleRecords.reduce<number>((acc, { sMVKReward }) => (acc += sMVKReward), 0) * mvkExchangeRate
            }
          />
        </var>
      </div>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
          XTZ Rewards
        </DataFeedSubTitleText>
        <var>
          {XTZ_USD ? (
            <CommaNumber
              showDecimal
              beginningText="$"
              value={oracle.oracleRecords.reduce<number>((acc, { XTZReward }) => (acc += XTZReward), 0) * XTZ_USD}
            />
          ) : (
            '-'
          )}
        </var>
      </div>
      <div className="item">
        <DataFeedSubTitleText fontSize={14} fontWeidth={500}>
          Accuracy
        </DataFeedSubTitleText>
        <var>
          <CommaNumber showDecimal value={Math.max(0, Math.min(oracle.accuracy, 100))} endingText="%" />
        </var>
      </div>
      <div className="item center-v">
        <SatelliteOracleStatusComponent statusType={oracleStatusType}>
          {ORACLE_STATUSES_MAPPER[oracleStatusType]}
        </SatelliteOracleStatusComponent>
      </div>
      <Link to={`/satellites/satellite-details/${oracle.address}`}>
        <div className="svg-wrapper">
          <svg>
            <use xlinkHref="/icons/sprites.svg#openLink" />
          </svg>
        </div>
      </Link>
    </SatelliteItemStyle>
  )
}
