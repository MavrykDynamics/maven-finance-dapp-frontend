import { useState } from 'react';
import { useQueryWithRefetch } from 'providers/common/hooks/useQueryWithRefetch';

import { convertNumberForClient } from 'utils/calcFunctions';

import { SATELLITES_STATS } from '../queries/satellitesStats.query';
import { MVK_DECIMALS } from 'utils/constants';
import { replaceNullValuesWithDefault } from 'providers/common/utils/repalceNullValuesWithDefault';

type SatelliteStatsStateType = {
  totalActiveSatellites: number;
  totalOracleNetworks: number;
  totalDelegatedMVK: number;
  averageOracleReward: number;
  oracleRewardsTotal: number;
};

const DEFAULT_SATELLITES_STATS = {
  totalActiveSatellites: 0,
  totalOracleNetworks: 0,
  totalDelegatedMVK: 0,
  averageOracleReward: 0,
  oracleRewardsTotal: 0,
};

export const useSatelliteStatistics = (): SatelliteStatsStateType & { isLoading: boolean } => {
  const [storage, setStorage] = useState<DeepNullable<SatelliteStatsStateType>>({
    totalActiveSatellites: null,
    totalOracleNetworks: null,
    totalDelegatedMVK: null,
    averageOracleReward: null,
    oracleRewardsTotal: null,
  });

  useQueryWithRefetch(
    SATELLITES_STATS,
    {
      onCompleted: data => {
        const totalDelegatedMVK = data.satellite_aggregate.nodes.reduce((acc, node) => {
          const satelliteTotalDelegatedAmount =
            node.delegations.length > 0
              ? node.delegations.reduce(
                  (sum, current) => sum + Number(current.user.smvk_balance),
                  0,
                )
              : 0;
          acc += Number(node.user.smvk_balance + satelliteTotalDelegatedAmount);
          return acc;
        }, 0);

        const oracleRewardsTotal = convertNumberForClient({
          number: data.oraclesRewards.aggregate?.sum?.reward ?? 0,
          grade: MVK_DECIMALS,
        });

        setStorage({
          ...storage,
          oracleRewardsTotal,
          averageOracleReward: oracleRewardsTotal / (data.oraclesAmount.aggregate?.count ?? 0),
          totalOracleNetworks: data.oraclesAmount.aggregate?.count ?? 0,
          totalActiveSatellites: data.activeSatellitesAmount.aggregate?.count ?? 0,
          totalDelegatedMVK: convertNumberForClient({
            number: totalDelegatedMVK,
            grade: MVK_DECIMALS,
          }),
        });
      },
    },
    {
      blocksDiff: 25,
    },
  );

  const isLoading =
    storage.oracleRewardsTotal === null ||
    storage.totalActiveSatellites === null ||
    storage.totalDelegatedMVK === null ||
    storage.averageOracleReward === null ||
    storage.totalOracleNetworks === null;

  return {
    ...replaceNullValuesWithDefault<SatelliteStatsStateType>(storage, DEFAULT_SATELLITES_STATS),
    isLoading,
  };
};
