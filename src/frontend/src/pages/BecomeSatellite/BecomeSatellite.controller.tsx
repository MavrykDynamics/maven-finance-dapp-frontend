import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

// Consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { CYAN } from 'app/App.components/TzAddress/TzAddress.constants'
import { INFO_DEFAULT, INFO_ERROR } from 'app/App.components/Info/info.constants'
import { SMVK_TOKEN_ADDRESS } from 'utils/constants'
import colors from 'styles/colors'
import { INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import {
  BecomeSatelliteFormStateType,
  DEFAULT_BECOME_SATELLITE_FORM,
  getFormTextBasedOnUserRole,
  getInputValidationStatus,
} from './BecomeSatellite.conts'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  REGISTER_SATELLITE_ACTION,
  UPDATE_SATELLITE_ACTION,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { CHECK_WHETHER_SATELLITE_EXISTS } from 'providers/SatellitesProvider/queries/satellites.query'

// providers
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useToasterContext } from 'providers/ToasterProvider/toaster.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'
import { HookContractActionArgs, useContractAction } from 'app/App.hooks/useContractAction'

// Actions
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { registerSatellite, updateSatellite } from 'providers/SatellitesProvider/actions/satellites.actions'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// Types
import { SatelliteRecordType } from 'providers/SatellitesProvider/satellites.provider.types'
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
import { UnregisterPopup } from './UnregisterPopup/UnregisterPopup'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'

// Styled components
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Page, PageContent } from 'styles'
import {
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteRegisterAsOracle,
  BecomeSatelliteOracleText,
} from './BecomeSatellite.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import { CustomLink } from 'app/App.components/CustomLink/CustomLink'

const connectWalletMessage = (
  <BecomeSatelliteFormBalanceCheck balanceOk={false}>
    <div>
      <Icon id="close-stroke" />
      Please connect your wallet
    </div>
  </BecomeSatelliteFormBalanceCheck>
)

export const BecomeSatellite = () => {
  const {
    satelliteMapper,
    setSatelliteAddressToSubsctibe,
    changeSatellitesSubscriptionsList,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()
  const {
    userAddress,
    isSatellite,
    satelliteMvkIsDelegatedTo,
    userAvatars: { mainAvatar },
    userTokensBalances,
    isLoading: isUserLoading,
  } = useUserContext()

  const {
    maxLengths: { satelliteDelegation },
    contractAddresses: { delegationAddress },
    preferences: { themeSelected },
    globalLoadingState: { isActionActive },
    minimumStakedMvkBalance,
  } = useDappConfigContext()

  const { bug } = useToasterContext()
  const { apolloClient } = useApolloContext()

  const [isSatelliteExistanseLoading, setIsSatelliteExistanseLoading] = useState(false)
  const [isSatelliteExistanseError, setIsSatelliteExistanseError] = useState(false)

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB,
    })

    return () => {
      changeSatellitesSubscriptionsList(DEFAULT_SATELLITES_ACTIVE_SUBS)
    }
  }, [])

  // check whether satellite exists, cuz address is stored in url and user can change it
  useLayoutEffect(() => {
    setIsSatelliteExistanseError(false)

    if ((userAddress && satelliteMapper[userAddress]) || !userAddress) return

    setIsSatelliteExistanseLoading(true)

    const checkWhetherSatelliteExists = async () => {
      try {
        const satelliteFromGql = await apolloClient.query({
          query: CHECK_WHETHER_SATELLITE_EXISTS,
          variables: {
            userAddress: userAddress ?? '',
          },
        })

        if (satelliteFromGql.data.satellite[0]?.user.address === userAddress) {
          setSatelliteAddressToSubsctibe(userAddress)
          return
        }

        setIsSatelliteExistanseError(true)
      } catch (e) {
        setIsSatelliteExistanseError(true)
      } finally {
        setIsSatelliteExistanseLoading(false)
      }
    }

    checkWhetherSatelliteExists()

    return () => setSatelliteAddressToSubsctibe(null)
  }, [userAddress])

  const isGhostnet = process.env.REACT_APP_NETWORK === 'ghostnet'

  const userSmvkBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })

  const balanceOverMinStakedMvk = userSmvkBalance >= minimumStakedMvkBalance
  const usersSatelliteProfile = userAddress ? satelliteMapper[userAddress] : null

  const [form, setForm] = useState(DEFAULT_BECOME_SATELLITE_FORM)
  const pageText = getFormTextBasedOnUserRole(isSatellite)
  const isUserOracle = Boolean(usersSatelliteProfile?.peerId || usersSatelliteProfile?.publicKey)
  const [isChecked, setIsChecked] = useState(isUserOracle)
  const showOracleWarning = isUserOracle && !isChecked

  const [showUnregisterPopup, setShowUnregisterPopup] = useState(false)

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

    return !balanceOverMinStakedMvk || !userAddress || !formIsValid || !hasChangedValues
  }, [userAddress, balanceOverMinStakedMvk, form, isChecked, usersSatelliteProfile])

  const mainRequestForm: RegisterAsSatelliteForm = useMemo(
    () => ({
      name: form.name.text,
      description: form.description.text,
      website: form.website.text,
      fee: Number(form.satelliteFee.text.replace('%', '')),
      image: form.image.text,
    }),
    [form],
  )

  // Remove peerId and publicKey fields from request if checkbox 'Register as Oracle" not chosen
  const requestData = useMemo(
    () =>
      isChecked
        ? { ...mainRequestForm, peerId: form.oraclePeerId.text, publicKey: form.oraclePublicKey.text }
        : mainRequestForm,
    [form.oraclePeerId.text, form.oraclePublicKey.text, isChecked, mainRequestForm],
  )

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
  }, [usersSatelliteProfile, userAddress])

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
            status: getInputValidationStatus(name, value.substring(0, value.length - 1), satelliteDelegation),
          },
        })
      } else {
        setForm({
          ...form,
          [name]: {
            text: `${value.replace('%', '')}%`,
            status: getInputValidationStatus(name, value.replace('%', ''), satelliteDelegation),
          },
        })
      }
    } else {
      setForm({ ...form, [name]: { text: value, status: getInputValidationStatus(name, value, satelliteDelegation) } })
    }
  }

  // Actions ------------------------------------------------

  // register action -------------
  const registerAction = useCallback(
    async (requestData: RegisterAsSatelliteForm) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!delegationAddress) {
        bug('Wrong delegation address.')
        return null
      }

      return await registerSatellite(userAddress, requestData, delegationAddress, satelliteMvkIsDelegatedTo)
    },
    [bug, delegationAddress, satelliteMvkIsDelegatedTo, userAddress],
  )

  const registerContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: REGISTER_SATELLITE_ACTION,
      actionFn: registerAction.bind(null, requestData),
    }),
    [registerAction, requestData],
  )

  const { action: handleRegister } = useContractAction(registerContractActionProps)

  // update action -------------
  const updateAction = useCallback(
    async (requestData: RegisterAsSatelliteForm) => {
      if (!userAddress) {
        bug('Click Connect in the left menu', 'Please connect your wallet')
        return null
      }
      if (!delegationAddress) {
        bug('Wrong delegation address')
        return null
      }

      return await updateSatellite(requestData, delegationAddress)
    },
    [bug, delegationAddress, userAddress],
  )

  const updateContractActionProps: HookContractActionArgs = useMemo(
    () => ({
      actionType: UPDATE_SATELLITE_ACTION,
      actionFn: updateAction.bind(null, requestData),
    }),
    [updateAction, requestData],
  )

  const { action: handleUpdate } = useContractAction(updateContractActionProps)

  // Handlers for register/unregister and update data
  const handleRegisterOrUpdateSatellite = async () => {
    usersSatelliteProfile && usersSatelliteProfile.currentlyRegistered ? await handleUpdate() : await handleRegister()
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

  const isPageLoading =
    (!isSatelliteExistanseError && isSatellitesLoading && userAddress) || isUserLoading || isSatelliteExistanseLoading

  return (
    <>
      <Page>
        <PageHeader page={isSatellite ? 'my satellite profile' : 'satellites'} avatar={mainAvatar} />

        {!balanceOverMinStakedMvk && !isPageLoading ? (
          <NotStakingBanner
            className="become-satellite"
            text={`To become a satellite you need to stake ${minimumStakedMvkBalance} MVK`}
          />
        ) : null}

        <PageContent className="mt-30">
          <div>
            {isPageLoading ? (
              <DataLoaderWrapper>
                <ClockLoader width={150} height={150} />
                <div className="text">Loading satellite data</div>
              </DataLoaderWrapper>
            ) : (
              <BecomeSatelliteForm>
                <H2Title>{pageText.pageTitle}</H2Title>
                {satelliteMvkIsDelegatedTo ? (
                  <div className="delegated-banner">
                    <Info
                      type={INFO_DEFAULT}
                      text={
                        <>
                          You are currently delegated to satellite{' '}
                          <CustomLink to={`/satellites/satellite-details/${satelliteMvkIsDelegatedTo}`}>
                            <TzAddress
                              tzAddress={satelliteMvkIsDelegatedTo}
                              hasIcon={false}
                              shouldCopy={false}
                              type={CYAN}
                            />
                          </CustomLink>
                          . When becoming a satellite, you will first be undelegated from your current satellite and
                          then registered as a satellite.
                        </>
                      }
                    />
                  </div>
                ) : null}

                <BecomeSatelliteOracleText>
                  <span>Important Note:</span> Becoming a Satellite offers the operation an oracle node. Technically,
                  one may become a Satellite without operating an oracle and take part in Governance. However, they will
                  forgo all of the oracle rewards which are a major source of payments. For information on operating an
                  oracle node for your Satellite, please read more on Gitbook{' '}
                  <CustomLink
                    to="https://mavryk.finance/litepaper#the-decentralized-oracle"
                    styling={{ underline: true }}
                  >
                    here
                  </CustomLink>
                  .
                </BecomeSatelliteOracleText>

                <CommaNumber
                  className="label"
                  value={Number(minimumStakedMvkBalance)}
                  beginningText={'1 - Stake at least'}
                  endingText={'MVK'}
                />

                {userAddress ? (
                  <BecomeSatelliteFormBalanceCheck balanceOk={balanceOverMinStakedMvk}>
                    <Icon id={balanceOverMinStakedMvk ? 'check-stroke' : 'close-stroke'} />
                    <CommaNumber value={userSmvkBalance} beginningText={'Currently staking'} endingText={'MVK'} />
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
                  textAreaMaxLimit={satelliteDelegation.satelliteDescriptionMaxLength}
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
                    <div className="label">{pageText.registerAsOracle}</div>

                    <Checkbox
                      id="become-satellite-is-oracle"
                      onChangeHandler={() => setIsChecked(!isChecked)}
                      checked={isChecked}
                      disabled={isGhostnet}
                    />
                  </div>

                  <Info
                    type={INFO_ERROR}
                    text={`Applying to become an Oracle for aggregators is disabled on testnet, it requires running hardware and software along with subscriptions to multiple API providers which are costly.`}
                  />

                  <BecomeSatelliteOracleText>
                    By registering as an oracle, you will be taking part in signing the oracle data feeds and earning
                    rewards for doing so. Please make sure to check the Gitbook (coming soon) for setting up the oracle
                    node. Upon registering, you need to be accepted via Satellite governance to start signing price
                    feeds and earning.
                  </BecomeSatelliteOracleText>

                  {isChecked && (
                    <div className="inputs">
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
                          disabled: isGhostnet,
                        }}
                      />

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
                          disabled: isGhostnet,
                        }}
                      />
                    </div>
                  )}

                  {showOracleWarning && (
                    <div className="warning">
                      <Info
                        text={`You are unregistering for being an oracle. This means you will no longer be able to sign price feeds and subsequently no longer receive rewards for participation in the oracle network.`}
                        type={INFO_ERROR}
                      />
                    </div>
                  )}
                </BecomeSatelliteRegisterAsOracle>

                <div className="buttons-wrapper">
                  {usersSatelliteProfile && usersSatelliteProfile.currentlyRegistered && (
                    <NewButton
                      kind={BUTTON_SECONDARY}
                      disabled={!usersSatelliteProfile.currentlyRegistered || isActionActive}
                      onClick={() => setShowUnregisterPopup(true)}
                    >
                      <Icon id="navigation-menu_close" /> Unregister Satellite
                    </NewButton>
                  )}

                  <NewButton
                    disabled={isUpdateButtonDisabled || isActionActive}
                    kind={BUTTON_PRIMARY}
                    onClick={handleRegisterOrUpdateSatellite}
                  >
                    <Icon id="satellite-small" />
                    {usersSatelliteProfile
                      ? usersSatelliteProfile.isSatelliteReady
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

      <UnregisterPopup
        show={Boolean(usersSatelliteProfile) && showUnregisterPopup}
        closePopup={() => setShowUnregisterPopup(false)}
        satellite={usersSatelliteProfile}
      />
    </>
  )
}
