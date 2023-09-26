import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'

// Consts
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from 'app/App.components/Button/Button.constants'
import { SECONDARY_TZ_ADDRESS_COLOR } from 'app/App.components/TzAddress/TzAddress.constants'
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
import { BecomeSatelliteBanners } from 'app/App.components/Info/Banners/BecomeSatelliteBanners/BecomeSatelliteBanners'
import {
  PRIMARY_SLIDING_TAB_BUTTONS,
  SECONDARY_SLIDING_TAB_BUTTONS,
  SMALL_SLIDING_TAB_BUTTONS,
} from 'app/App.components/SlidingTabButtons/SlidingTabButtons.conts'
import { SlidingTabButtons } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { SatelliteDetailsScreen } from './screens/SatelliteDetails.screen'
import { BecomeSatelliteScreen } from './screens/BecomeSatellite.screen'

export const BecomeSatellite = () => {
  const {
    contractAddresses: { delegationAddress, mvkTokenAddress },
    minimumStakedMvkBalance,
  } = useDappConfigContext()
  const {
    satelliteMapper,
    setSatelliteAddressToSubsctibe,
    changeSatellitesSubscriptionsList,
    isLoading: isSatellitesLoading,
  } = useSatellitesContext()
  const {
    userAddress,
    isSatellite,
    userAvatars: { mainAvatar },
    isLoading: isUserLoading,
    userTokensBalances,
  } = useUserContext()
  const { apolloClient } = useApolloContext()

  // local states
  const [showUnregisterPopup, setShowUnregisterPopup] = useState(false)
  const [isSatelliteExistanseLoading, setIsSatelliteExistanseLoading] = useState(false)
  const [isSatelliteExistanseError, setIsSatelliteExistanseError] = useState(false)
  const [activeTabId, setActiveTabId] = useState(0)

  // derived states
  const usersSatelliteProfile = userAddress ? satelliteMapper[userAddress] : null
  const userSmvkBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVK_TOKEN_ADDRESS })
  const userMvkBalance = getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvkTokenAddress })

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

  const isPageLoading =
    (!isSatelliteExistanseError && isSatellitesLoading && userAddress) || isUserLoading || isSatelliteExistanseLoading

  const tabList = useMemo(
    () => [
      { text: 'Satellite Details', id: 0, active: true },
      { text: 'Edit Profile', id: 1, active: false },
    ],
    [],
  )

  // TODO add url handling when page refresh
  const handleChangeTabs = useCallback((id: number) => {
    setActiveTabId(id)
  }, [])

  return (
    <>
      <Page>
        <PageHeader page={isSatellite ? 'my satellite profile' : 'satellites'} avatar={mainAvatar} />

        {!isPageLoading ? (
          <BecomeSatelliteBanners
            smvkBalance={userSmvkBalance}
            requiredSmvkAmount={minimumStakedMvkBalance}
            userAddress={userAddress}
            mvkBalance={userMvkBalance}
            isSatellite={isSatellite}
          />
        ) : null}

        {isSatellite && (
          <SlidingTabButtons kind={SECONDARY_SLIDING_TAB_BUTTONS} tabItems={tabList} onClick={handleChangeTabs} />
        )}

        <PageContent className="mt-30">
          <div>
            {isPageLoading ? (
              <DataLoaderWrapper>
                <ClockLoader width={150} height={150} />
                <div className="text">Loading satellite data</div>
              </DataLoaderWrapper>
            ) : (
              <BecomeSatelliteForm>
                <H2Title>{tabList[activeTabId]?.text}</H2Title>
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
                  {activeTabId === 0 && (
                    <BecomeSatelliteScreen
                      usersSatelliteProfile={usersSatelliteProfile}
                      setShowUnregisterPopup={setShowUnregisterPopup}
                      setIsSatelliteExistanseLoading={setIsSatelliteExistanseLoading}
                      setIsSatelliteExistanseError={setIsSatelliteExistanseError}
                      userSmvkBalance={userSmvkBalance}
                    />
                  )}
                  {activeTabId === 1 && <SatelliteDetailsScreen />}
                </BecomeSatelliteOracleText>
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
