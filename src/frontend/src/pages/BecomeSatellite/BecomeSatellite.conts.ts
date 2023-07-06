import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { State } from 'reducers'
import { isNotAllWhitespace, isValidLength, validatePublicKey } from 'utils/validatorFunctions'
import { defaultOraclePeerIdMaxLength } from 'app/App.components/Input/Input.constants'

import { SatelliteDelegationMaxLength } from 'providers/DappConfigProvider/dappConfig.provider.types'

export const getFormTextBasedOnUserRole = (isUserSatellite: boolean) => ({
  pageTitle: isUserSatellite ? 'Edit Satellite Profile' : 'Become a Satellite',
  nameInputLabel: isUserSatellite ? '2 - Edit your name' : '2 - Enter your name',
  websiteInputLabel: isUserSatellite ? '3 - Edit your website' : '3 - Enter your website',
  descrInputLabel: isUserSatellite ? '4 - Edit description' : '4 - Enter description',
  feeInputLabel: isUserSatellite ? '5 - Edit your fee (%)' : '5 - Enter your fee (%)',
  registerAsOracle: isUserSatellite ? '7 - Register as Oracle' : '7 - Register as Oracle',
  oraclePublicKey: isUserSatellite ? '7a - Oracle Public Key' : '7a - Oracle Public Key',
  oraclePeerId: isUserSatellite ? '7b - Oracle Peer ID' : '7b - Oracle Peer ID',
})

export const getInputValidationStatus = (
  name: string,
  value: string,
  satelliteConfig: SatelliteDelegationMaxLength,
): InputStatusType => {
  switch (name) {
    case 'name':
      return isNotAllWhitespace(value) && isValidLength(value, 1, satelliteConfig.satelliteNameMaxLength)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR
    case 'description':
      return isNotAllWhitespace(value) && isValidLength(value, 1, satelliteConfig.satelliteDescriptionMaxLength)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR
    case 'website':
      return isNotAllWhitespace(value) && isValidLength(value, 1, satelliteConfig.satelliteWebsiteMaxLength)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR
    case 'satelliteFee':
      return Number(value) >= 0 && Number(value) <= 100 ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
    case 'image':
      return value ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
    case 'oraclePeerId':
      return isValidLength(value, defaultOraclePeerIdMaxLength, defaultOraclePeerIdMaxLength)
        ? INPUT_STATUS_SUCCESS
        : INPUT_STATUS_ERROR
    case 'oraclePublicKey':
      return validatePublicKey(value) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  }

  return ''
}

type FormFieldType = {
  text: string
  status: InputStatusType
}

export type BecomeSatelliteFormStateType = {
  name: FormFieldType
  description: FormFieldType
  website: FormFieldType
  satelliteFee: FormFieldType
  image: FormFieldType
  oraclePeerId: FormFieldType
  oraclePublicKey: FormFieldType
}

const DEFAULT_FORM_FIELD_VALUE: FormFieldType = {
  text: '',
  status: '',
}

export const DEFAULT_BECOME_SATELLITE_FORM: BecomeSatelliteFormStateType = {
  name: DEFAULT_FORM_FIELD_VALUE,
  description: DEFAULT_FORM_FIELD_VALUE,
  website: DEFAULT_FORM_FIELD_VALUE,
  satelliteFee: {
    text: '0%',
    status: '',
  },
  image: DEFAULT_FORM_FIELD_VALUE,
  oraclePeerId: DEFAULT_FORM_FIELD_VALUE,
  oraclePublicKey: DEFAULT_FORM_FIELD_VALUE,
}
