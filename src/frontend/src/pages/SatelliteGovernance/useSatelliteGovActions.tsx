import { useCallback, useMemo } from 'react'

// providers
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// types
import { ActionErrorReturnType, ActionSuccessReturnType } from 'providers/DappConfigProvider/dappConfig.provider.types'
import { SatelliteGovernanceTransfer } from 'providers/SatellitesProvider/satellites.provider.types'

// hooks
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// consts
import {
  ADD_ORACLES_AGGREGATOR_ACTION,
  BAN_SATELLITE_ACTION,
  FIX_MISTAKEN_TRANSFER_ACTION,
  REGISTER_AGGREGATOR_ACTION,
  REMOVE_ORACLES_ACTION,
  REMOVE_ORACLES_AGGREGATOR_ACTION,
  RESTORE_SATELLITE_ACTION,
  SET_AGGREGATOR_MAINTAINER_ACTION,
  SUSPEND_SATELLITE_ACTION,
  UNBAN_SATELLITE_ACTION,
  UNSUSPEND_SATELLITE_ACTION,
  UPDATE_AGGREGATOR_STATUS_ACTION,
} from 'providers/SatellitesGovernanceProvider/helpers/satellitesGov.consts'

// actions
import {
  addOracleToAggregator,
  banSatellite,
  fixMistakenTransfer,
  registerAggregator,
  removeOracleInAggregator,
  removeOracleFromSatellite,
  restoreSatellite,
  setAggregatorMaintainer,
  suspendSatellite,
  unsuspendSatellite,
  updateAggregatorStatus,
} from 'providers/SatellitesGovernanceProvider/actions/satellitesGov.actions'

export const useSatelliteGovActions = (satelliteAddress: string, oracleAddress: string, purpose: string) => {
  const {
    contractAddresses: { governanceSatelliteAddress },
  } = useDappConfigContext()
  const { userAddress } = useUserContext()
  const { bug } = useToasterContext()

  //   action helpers for actions with same parameters -----------------------------------------
  const invokeActionWithSatellitAddressAndPurpose = useCallback(
    async (
      actionFn: (
        governanceSatelliteAddress: string,
        satelliteAddress: string,
        purpose: string,
      ) => Promise<ActionErrorReturnType | ActionSuccessReturnType>,
    ) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceSatelliteAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      if (!satelliteAddress || !purpose) {
        bug('Wrong selected data')
        return null
      }

      return await actionFn(governanceSatelliteAddress, satelliteAddress, purpose)
    },
    [bug, governanceSatelliteAddress, purpose, satelliteAddress, userAddress],
  )

  const invokeActionWithOracle = useCallback(
    async (
      actionFn: (
        governanceSatelliteAddress: string,
        oracleAddress: string,
        satelliteAddress: string,
        purpose: string,
      ) => Promise<ActionErrorReturnType | ActionSuccessReturnType>,
    ) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      if (!governanceSatelliteAddress) {
        bug('Wrong governance address')
        return null
      }

      if (!satelliteAddress || !purpose || !oracleAddress) {
        bug('Wrong selected data')
        return null
      }

      return await actionFn(governanceSatelliteAddress, oracleAddress, satelliteAddress, purpose)
    },
    [bug, governanceSatelliteAddress, oracleAddress, purpose, satelliteAddress, userAddress],
  )

  //   ACTIONS

  //   suspend action ---------------------------------------------------------------------------
  const suspendSatelliteContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SUSPEND_SATELLITE_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, suspendSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: suspendSatelliteAction } = useContractAction(suspendSatelliteContratActionProps)

  //   unsuspend action ---------------------------------------------------------------------------
  const unSuspendSatelliteContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNSUSPEND_SATELLITE_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, unsuspendSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: unsuspendSatelliteAction } = useContractAction(unSuspendSatelliteContratActionProps)

  //   banSatellite action ---------------------------------------------------------------------------
  const banSatelliteContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: BAN_SATELLITE_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, banSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: banSatelliteAction } = useContractAction(banSatelliteContratActionProps)

  //   unbanSatellite action ---------------------------------------------------------------------------
  const unbanSatelliteContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UNBAN_SATELLITE_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, banSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: unbanSatelliteAction } = useContractAction(unbanSatelliteContratActionProps)

  //   removeOracles action ---------------------------------------------------------------------------
  const removeOraclesContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_ORACLES_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, removeOracleFromSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: removeOraclesAction } = useContractAction(removeOraclesContratActionProps)

  //   restoreSatellite action ---------------------------------------------------------------------------
  const restoreSatelliteContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: RESTORE_SATELLITE_ACTION,
      actionFn: invokeActionWithSatellitAddressAndPurpose.bind(null, restoreSatellite),
    }),
    [invokeActionWithSatellitAddressAndPurpose],
  )

  const { action: restoreSatelliteAction } = useContractAction(restoreSatelliteContratActionProps)

  //   removeOracleInAggregator action ---------------------------------------------------------------------------
  const removeOracleInAggregatorContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REMOVE_ORACLES_AGGREGATOR_ACTION,
      actionFn: invokeActionWithOracle.bind(null, removeOracleInAggregator),
    }),
    [invokeActionWithOracle],
  )

  const { action: removeOracleInAggregatorAction } = useContractAction(removeOracleInAggregatorContratActionProps)

  //   addOracleToAggregator action ---------------------------------------------------------------------------
  const addOracleToAggregatorContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: ADD_ORACLES_AGGREGATOR_ACTION,
      actionFn: invokeActionWithOracle.bind(null, addOracleToAggregator),
    }),
    [invokeActionWithOracle],
  )

  const { action: addOracleToAggregatorAction } = useContractAction(addOracleToAggregatorContratActionProps)

  //   setAggregatorMaintainer action ---------------------------------------------------------------------------
  const setAggregatorMaintainerContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: SET_AGGREGATOR_MAINTAINER_ACTION,
      actionFn: invokeActionWithOracle.bind(null, setAggregatorMaintainer),
    }),
    [invokeActionWithOracle],
  )

  const { action: setAggregatorMaintainerAction } = useContractAction(setAggregatorMaintainerContratActionProps)

  //   updateAggregatorStatus action ---------------------------------------------------------------------------
  const updateAggregatorStatusContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_AGGREGATOR_STATUS_ACTION,
      actionFn: invokeActionWithOracle.bind(null, updateAggregatorStatus),
    }),
    [invokeActionWithOracle],
  )

  const { action: updateAggregatorStatusAction } = useContractAction(updateAggregatorStatusContratActionProps)

  //   registerAggregator action ---------------------------------------------------------------------------
  const registerAggregatorActionFn = useCallback(async () => {
    if (!userAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }
    if (!governanceSatelliteAddress) {
      bug('Click Connect in the left menu', 'Please connect your wallet')
      return null
    }

    if (!satelliteAddress || !oracleAddress) {
      bug('Wrong selected data')
      return null
    }

    return await registerAggregator(governanceSatelliteAddress, oracleAddress, satelliteAddress)
  }, [bug, governanceSatelliteAddress, oracleAddress, satelliteAddress, userAddress])

  const registerAggregatorContratActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REGISTER_AGGREGATOR_ACTION,
      actionFn: registerAggregatorActionFn,
    }),
    [registerAggregatorActionFn],
  )

  const { action: registerAggregatorAction } = useContractAction(registerAggregatorContratActionProps)

  //   fixMistakenTransfer action ---------------------------------------------------------------------------
  const fixMistakenTransferActionFn = useCallback(
    async (validateTableData: SatelliteGovernanceTransfer[]) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!governanceSatelliteAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }

      if (!satelliteAddress || !oracleAddress || !validateTableData) {
        bug('Wrong selected data')
        return null
      }

      return await fixMistakenTransfer(governanceSatelliteAddress, satelliteAddress, oracleAddress, validateTableData)
    },
    [bug, governanceSatelliteAddress, oracleAddress, satelliteAddress, userAddress],
  )

  const fixMistakenTransferContratActionProps: HookContractActionArgs<SatelliteGovernanceTransfer[]> = useMemo(
    () => ({
      actionType: FIX_MISTAKEN_TRANSFER_ACTION,
      actionFn: fixMistakenTransferActionFn,
    }),
    [fixMistakenTransferActionFn],
  )

  const { actionWithArgs: fixMistakenTransferAction } = useContractAction(fixMistakenTransferContratActionProps)

  return {
    suspendSatelliteAction,
    unsuspendSatelliteAction,
    banSatelliteAction,
    unbanSatelliteAction,
    removeOraclesAction,
    restoreSatelliteAction,
    removeOracleInAggregatorAction,
    addOracleToAggregatorAction,
    setAggregatorMaintainerAction,
    updateAggregatorStatusAction,
    registerAggregatorAction,
    fixMistakenTransferAction,
  }
}
