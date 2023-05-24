import type { AppDispatch, GetState } from '../../app/App.controller'

export const GET_SATELLITES_STORAGE = 'GET_SATELLITES_STORAGE'
export const getSatellitesStorage = () => async (dispatch: AppDispatch, getState: GetState) => {}

export const GET_SATELLITE_CONFIG = 'GET_SATELLITE_CONFIG'

export const delegate = (satelliteAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {}

export const undelegate = (delegateAddress: string) => async (dispatch: AppDispatch, getState: GetState) => {}

export const distributeProposalRewards = (a: any, b: any) => async (dispatch: AppDispatch, getState: GetState) => {}
