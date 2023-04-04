import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

// Consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import {
  BecomeSatelliteFormStateType,
  DEFAULT_BECOME_SATELLITE_FORM,
  getFormTextBasedOnUserRole,
  getInputValidationStatus,
} from './BecomeSatellite.conts'

// Actions
import { getDoormanStorage } from 'pages/Doorman/Doorman.actions'
import { registerAsSatellite, unregisterAsSatellite, updateSatelliteRecord } from './BecomeSatellite.actions'
import { getSatelliteConfig } from 'pages/Satellites/Satellites.actions'
import { useDataLoader } from 'utils/useDataLoader/useDataLoader'

// Types
import { SatelliteRecordType } from 'utils/TypesAndInterfaces/Satellites'
import { State } from 'reducers'
import { RegisterAsSatelliteForm } from '../../utils/TypesAndInterfaces/Forms'

// Views
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import { NotStakingBanner } from 'pages/Satellites/components/NotStakingBanner.view'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/NewInput'
import Icon from 'app/App.components/Icon/Icon.view'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import { TextArea } from 'app/App.components/TextArea/TextArea.controller'
import { IPFSUploader } from 'app/App.components/IPFSUploader/IPFSUploader.controller'
import NewButton from 'app/App.components/Button/NewButton'
import Checkbox from 'app/App.components/Checkbox/Checkbox.view'
import { Info } from 'app/App.components/Info/Info.view'
import { CustomTooltip } from 'app/App.components/Tooltip/Tooltip.view'

// Styled components
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Page, PageContent } from 'styles'
import colors from 'styles/colors'
import {
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteRegisterAsOracle,
  BecomeSatelliteOracleText,
} from './BecomeSatellite.style'

const connectWalletMessage = (
  <BecomeSatelliteFormBalanceCheck balanceOk={false}>
    <div>
      <Icon id="close-stroke" />
      Please connect your wallet
    </div>
  </BecomeSatelliteFormBalanceCheck>
)

export const BecomeSatellite = () => {
  const dispatch = useDispatch()
  const {
    accountPkh = '',
    user: { mySMvkTokenBalance, isSatellite },
  } = useSelector((state: State) => state.wallet)
  const {
    satelliteMapper,
    config: { minimumStakedMvkBalance, isConfigLoaded, ...restSatelliteConfig },
  } = useSelector((state: State) => state.satellites)
  const { isLoaded: isDoormanLoaded } = useSelector((state: State) => state.doorman)
  const { themeSelected } = useSelector((state: State) => state.preferences)

  const { isLoading } = useDataLoader(
    async (isDepsChanged) => {
      try {
        await Promise.all(
          [
            (!isConfigLoaded || isDepsChanged) && dispatch(getSatelliteConfig()),
            (!isDoormanLoaded || isDepsChanged) && dispatch(getDoormanStorage()),
          ].filter(Boolean),
        )
      } catch (error) {}
    },
    [accountPkh],
  )

  const balanceOverMinStakedMvk = mySMvkTokenBalance >= minimumStakedMvkBalance
  const usersSatelliteProfile = satelliteMapper[accountPkh] ?? null

  const [form, setForm] = useState(DEFAULT_BECOME_SATELLITE_FORM)
  const [isChecked, setIsChecked] = useState(false)
  const pageText = getFormTextBasedOnUserRole(Boolean(usersSatelliteProfile))
  const isUserOracle = Boolean(usersSatelliteProfile?.peerId || usersSatelliteProfile?.publicKey)
  const showOracleWarning = isUserOracle && !isChecked

  // Disable update button when no user connected, not enoght sMVK to become a satellite, not full valid form, or user is satellite, but hasn't changed nothing
  const isUpdateButtonDisabled = useMemo(() => {
    // Remove oraclePeerId and oraclePublicKey fields from validation if checkbox 'Register as Oracle" not chosen
    const formForValidation = isChecked
      ? form
      : Object.fromEntries(
          Object.entries(form).filter((item) => {
            switch (item[0]) {
              case 'oraclePeerId':
                return false
              case 'oraclePublicKey':
                return false
              default:
                return true
            }
          }),
        )

    const formIsValid = Object.values(formForValidation).every(({ status }) => status === INPUT_STATUS_SUCCESS)
    const hasChangedValues = Object.entries(formForValidation).some(([key, { text }]) => {
      const existingSatelliteField = usersSatelliteProfile?.[key as keyof SatelliteRecordType]

      if (existingSatelliteField) {
        return text !== String(existingSatelliteField)
      }

      return text !== DEFAULT_BECOME_SATELLITE_FORM[key as keyof BecomeSatelliteFormStateType].text
    })

    return !balanceOverMinStakedMvk || !accountPkh || !formIsValid || !hasChangedValues
  }, [accountPkh, balanceOverMinStakedMvk, form, isChecked, usersSatelliteProfile])

  // Set satellite data if user is satellite
  useEffect(() => {
    if (usersSatelliteProfile) {
      setForm({
        name: { text: usersSatelliteProfile.name, status: INPUT_STATUS_SUCCESS },
        description: { text: usersSatelliteProfile.description, status: INPUT_STATUS_SUCCESS },
        website: { text: usersSatelliteProfile.website, status: INPUT_STATUS_SUCCESS },
        satelliteFee: { text: String(usersSatelliteProfile.satelliteFee + '%'), status: INPUT_STATUS_SUCCESS },
        image: { text: usersSatelliteProfile.image, status: INPUT_STATUS_SUCCESS },
        oraclePeerId: {
          text: usersSatelliteProfile.peerId,
          status: usersSatelliteProfile.peerId ? INPUT_STATUS_SUCCESS : '',
        },
        oraclePublicKey: {
          text: usersSatelliteProfile.publicKey,
          status: usersSatelliteProfile.publicKey ? INPUT_STATUS_SUCCESS : '',
        },
      })
    } else {
      setForm(DEFAULT_BECOME_SATELLITE_FORM)
    }
  }, [usersSatelliteProfile, accountPkh])

  console.log({ form })

  // Set checkbox === true if satellite is oracle
  useEffect(() => {
    if (isChecked === isUserOracle) return
    setIsChecked(isUserOracle)
  }, [isUserOracle])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } },
  ) => {
    const {
      target: { name, value },
    } = e

    // If we enter satelliteFee we need to manipulate '%' in the end of the string
    if (name === 'satelliteFee') {
      const isRemoving = value.length < form.satelliteFee.text.length

      if (isRemoving) {
        setForm({
          ...form,
          [name]: {
            text: `${value.substring(0, value.length - 1)}%`,
            status: getInputValidationStatus(name, value.substring(0, value.length - 1), restSatelliteConfig),
          },
        })
      } else {
        setForm({
          ...form,
          [name]: {
            text: `${value.replace('%', '')}%`,
            status: getInputValidationStatus(name, value.replace('%', ''), restSatelliteConfig),
          },
        })
      }
    } else {
      setForm({ ...form, [name]: { text: value, status: getInputValidationStatus(name, value, restSatelliteConfig) } })
    }
  }

  // Handlers for register/unregister and update data
  const handleUnregisterSatellite = () => dispatch(unregisterAsSatellite())

  const handleRegisterOrUpdateSatellite = () => {
    const mainRequestForm: RegisterAsSatelliteForm = {
      name: form.name.text,
      description: form.description.text,
      website: form.website.text,
      fee: Number(form.satelliteFee.text.replace('%', '')),
      image: form.image.text,
    }

    // Remove peerId and publicKey fields from request if checkbox 'Register as Oracle" not chosen
    const requestData = isChecked
      ? { ...mainRequestForm, peerId: form.oraclePeerId.text, publicKey: form.oraclePublicKey.text }
      : mainRequestForm

    usersSatelliteProfile && usersSatelliteProfile.currentlyRegistered
      ? dispatch(updateSatelliteRecord(requestData))
      : dispatch(registerAsSatellite(requestData))
  }

  const tooltipPublicKey = (
    <CustomTooltip
      text="The Oracle Public ID is the tz1 address of your satellite. Follow the Oracle documentation for more info."
      iconId="info"
      className="info-tooltip"
      defaultStrokeColor={colors[themeSelected]['textColor']}
    />
  )

  const tooltipPeerId = (
    <CustomTooltip
      text="The Oracle peer ID is a unique hash generated by the p2p library used when you are setting up your Oracle hardware. Follow the Oracle documentation to obtain this value."
      iconId="info"
      className="info-tooltip"
      defaultStrokeColor={colors[themeSelected]['textColor']}
    />
  )

  return (
    <Page>
      <PageHeader
        page={isSatellite ? 'my satellite profile' : 'satellites'}
        avatar={usersSatelliteProfile?.image || '/images/default-avatar.png'}
      />

      {!balanceOverMinStakedMvk && (
        <NotStakingBanner text={`To become a satellite you need to stake ${minimumStakedMvkBalance} MVK`} />
      )}

      <PageContent>
        <div>
          {isLoading ? (
            <DataLoaderWrapper>
              <ClockLoader width={150} height={150} />
              <div className="text">Loading satellite data</div>
            </DataLoaderWrapper>
          ) : (
            <BecomeSatelliteForm>
              <h2>{pageText.pageTitle}</h2>
              <BecomeSatelliteOracleText>
                Important Note: Becoming a Satellite offers the operation an oracle node. Technically, one may become a
                Satellite without operating an oracle and take part in Governance. However, they will forgo all of the
                oracle rewards which are a major source of payments. For information on operating an oracle node for
                your Satellite, please read more on Gitbook{' '}
                <a href="https://mavryk.finance/litepaper#the-decentralized-oracle" target="_blank" rel="noreferrer">
                  here
                </a>
                .
              </BecomeSatelliteOracleText>
              <CommaNumber
                className="label"
                value={Number(minimumStakedMvkBalance)}
                beginningText={'1 - Stake at least'}
                endingText={'MVK'}
              />

              {accountPkh ? (
                <BecomeSatelliteFormBalanceCheck balanceOk={balanceOverMinStakedMvk}>
                  <Icon id={balanceOverMinStakedMvk ? 'check-stroke' : 'close-stroke'} />
                  <CommaNumber
                    value={Number(mySMvkTokenBalance)}
                    beginningText={'Currently staking'}
                    endingText={'MVK'}
                  />
                </BecomeSatelliteFormBalanceCheck>
              ) : (
                connectWalletMessage
              )}

              <div className="row">
                <Input
                  settings={{
                    label: pageText.nameInputLabel,
                    inputStatus: form.name.status,
                  }}
                  inputProps={{
                    value: form.name.text,
                    placeholder: 'Name',
                    name: 'name',
                    onChange: handleChange,
                    required: true,
                  }}
                />

                <Input
                  settings={{
                    label: pageText.websiteInputLabel,
                    inputStatus: form.website.status,
                  }}
                  inputProps={{
                    value: form.website.text,
                    placeholder: 'Website',
                    name: 'website',
                    onChange: handleChange,
                    required: true,
                  }}
                />
              </div>

              <TextArea
                placeholder="Your description here..."
                value={form.description.text}
                onChange={handleChange}
                inputStatus={form.description.status}
                name={'description'}
                textAreaMaxLimit={restSatelliteConfig.satelliteDescriptionMaxLength}
                label={pageText.descrInputLabel}
              />

              <Input
                className="input-fee-wrap"
                settings={{
                  label: pageText.feeInputLabel,
                  inputStatus: form.satelliteFee.status,
                }}
                inputProps={{
                  value: form.satelliteFee.text,
                  placeholder: 'Fee',
                  name: 'satelliteFee',
                  onChange: handleChange,
                  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) =>
                    !/^\d*\.?\d*$/.test(e.key) && e.key !== 'Backspace' && e.preventDefault(),
                  required: true,
                }}
              />

              <IPFSUploader
                typeFile="image"
                imageIpfsUrl={form.image.text}
                setIpfsImageUrl={(e: string) => {
                  handleChange({
                    target: {
                      name: 'image',
                      value: e,
                    },
                  })
                }}
                title={'Upload your photo'}
                listNumber={6}
              />

              <BecomeSatelliteRegisterAsOracle>
                <div className="checkbox">
                  {pageText.registerAsOracle}

                  <Checkbox id="show_dropped" onChangeHandler={() => setIsChecked(!isChecked)} checked={isChecked} />
                </div>

                <BecomeSatelliteOracleText>
                  By registering as an oracle, you will be taking part in signing the oracle data feeds and earning
                  rewards for doing so.
                </BecomeSatelliteOracleText>

                {isChecked && (
                  <div className="inputs">
                    <Input
                      settings={{
                        label: pageText.oraclePeerId,
                        tooltip: tooltipPeerId,
                        inputStatus: form.oraclePeerId.status,
                      }}
                      inputProps={{
                        value: form.oraclePeerId.text,
                        placeholder: 'Enter Oracle Peer ID',
                        name: 'oraclePeerId',
                        onChange: handleChange,
                        required: true,
                      }}
                    />

                    <Input
                      settings={{
                        label: pageText.oraclePublicKey,
                        tooltip: tooltipPublicKey,
                        inputStatus: form.oraclePublicKey.status,
                      }}
                      inputProps={{
                        value: form.oraclePublicKey.text,
                        placeholder: 'Enter Public Key',
                        name: 'oraclePublicKey',
                        onChange: handleChange,
                        required: true,
                      }}
                    />
                  </div>
                )}

                {showOracleWarning && (
                  <Info
                    text={
                      'You are unregistering for being an oracle. This means you will no longer be able to sign price feeds and subsequently no longer receive rewards for participation in the oracle network.'
                    }
                    type="warning"
                    className="oracleWarning"
                  ></Info>
                )}
              </BecomeSatelliteRegisterAsOracle>

              <div className="buttons-wrapper">
                {usersSatelliteProfile && usersSatelliteProfile.currentlyRegistered && (
                  <NewButton
                    kind={BUTTON_SECONDARY}
                    disabled={!usersSatelliteProfile.currentlyRegistered}
                    onClick={handleUnregisterSatellite}
                  >
                    <Icon id="navigation-menu_close" /> Unregister Satellite
                  </NewButton>
                )}

                <NewButton
                  disabled={isUpdateButtonDisabled}
                  kind={BUTTON_PRIMARY}
                  onClick={handleRegisterOrUpdateSatellite}
                >
                  <Icon id="satellite-small" />
                  {usersSatelliteProfile
                    ? usersSatelliteProfile.currentlyRegistered
                      ? 'Update Satellite Info'
                      : 'Register Satellite'
                    : 'Become a Satellite'}
                </NewButton>
              </div>
            </BecomeSatelliteForm>
          )}
        </div>
        <SatellitesSideBar isButton={false} />
      </PageContent>
    </Page>
  )
}
