import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Redirect, Route, Switch, useParams } from 'react-router'

// Consts
import { SMVN_TOKEN_ADDRESS } from 'utils/constants'
import {
  DEFAULT_SATELLITES_ACTIVE_SUBS,
  SATELLITE_DATA_SUB,
  SATELLITE_PARTICIPATION_DATA_SUB,
  SATELLITES_DATA_SINGLE_SUB,
} from 'providers/SatellitesProvider/satellites.const'
import { CHECK_WHETHER_SATELLITE_EXISTS } from 'providers/SatellitesProvider/queries/satellites.query'
import { SATELLITE_TAB_DETAILS, SATELLITE_TAB_EDIT, SatelliteTabType } from './BecomeSatellite.conts'

// providers
import { useApolloContext } from 'providers/ApolloProvider/apollo.provider'
import { useSatellitesContext } from 'providers/SatellitesProvider/satellites.provider'
import { useUserContext } from 'providers/UserProvider/user.provider'

// Actions
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import { getUserTokenBalanceByAddress } from 'providers/UserProvider/helpers/userBalances.helpers'

// Views
import { ClockLoader } from 'app/App.components/Loader/Loader.view'
import { PageHeader } from 'app/App.components/PageHeader/PageHeader.controller'
import SatellitesSideBar from 'pages/Satellites/SatellitesSideBar/SatellitesSideBar.controller'
import ProtectedRoute from 'app/App.components/AppRoutes/ProtectedRoute'

// Styled components
import { DataLoaderWrapper } from 'app/App.components/Loader/Loader.style'
import { Page, PageContent } from 'styles'
import { BecomeSatelliteForm, BecomeSatelliteNavigation, BecomeSatelliteOracleText } from './BecomeSatellite.style'
import { H2Title } from 'styles/generalStyledComponents/Titles.style'
import CustomLink from 'app/App.components/CustomLink/CustomLink'
import { BecomeSatelliteBanners } from 'app/App.components/Info/Banners/BecomeSatelliteBanners/BecomeSatelliteBanners'
import { SatelliteDetailsScreen } from './screens/SatelliteDetails.screen'
import { BecomeSatelliteScreen } from './screens/BecomeSatellite.screen'

const pageTexts = {
  [SATELLITE_TAB_DETAILS]: 'Satellite Details',
  [SATELLITE_TAB_EDIT]: 'Edit Profile',
}

export const BecomeSatellite = () => {
  const {
    contractAddresses: { mvnTokenAddress },
    minimumStakedMvnBalance,
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

  const { tabId } = useParams<{ tabId: SatelliteTabType }>()

  // local states
  const [isSatelliteExistanseLoading, setIsSatelliteExistanseLoading] = useState(false)
  const [isSatelliteExistanseError, setIsSatelliteExistanseError] = useState(false)

  // derived states
  const { usersSatelliteProfile, userSmvkBalance, userMvkBalance } = useMemo(
    () => ({
      usersSatelliteProfile: userAddress ? satelliteMapper[userAddress] : null,
      userSmvkBalance: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: SMVN_TOKEN_ADDRESS }),
      userMvkBalance: getUserTokenBalanceByAddress({ userTokensBalances, tokenAddress: mvnTokenAddress }),
    }),
    [mvnTokenAddress, satelliteMapper, userAddress, userTokensBalances],
  )

  useEffect(() => {
    changeSatellitesSubscriptionsList({
      [SATELLITE_DATA_SUB]: SATELLITES_DATA_SINGLE_SUB,
      [SATELLITE_PARTICIPATION_DATA_SUB]: true,
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

  return (
    <>
      <Page>
        <PageHeader page={isSatellite ? 'my satellite profile' : 'satellites'} avatar={mainAvatar} />

        {!isPageLoading ? (
          <BecomeSatelliteBanners
            smvkBalance={userSmvkBalance}
            requiredSmvkAmount={minimumStakedMvnBalance}
            userAddress={userAddress}
            mvkBalance={userMvkBalance}
            isSatellite={isSatellite}
          />
        ) : null}

        {isSatellite && (
          <BecomeSatelliteNavigation>
            <CustomLink
              to={`/become-satellite/:tabId`}
              params={{ tabId: SATELLITE_TAB_DETAILS }}
              styling={{
                navigationLink: tabId !== SATELLITE_TAB_DETAILS,
                navigationActiveLink: tabId === SATELLITE_TAB_DETAILS,
              }}
            >
              Satellite Details
            </CustomLink>
            <CustomLink
              to={`/become-satellite/:tabId`}
              params={{ tabId: SATELLITE_TAB_EDIT }}
              styling={{
                navigationLink: tabId !== SATELLITE_TAB_EDIT,
                navigationActiveLink: tabId === SATELLITE_TAB_EDIT,
              }}
            >
              Edit Profile
            </CustomLink>
          </BecomeSatelliteNavigation>
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
                <H2Title>{pageTexts[tabId] ?? ''}</H2Title>
                <BecomeSatelliteOracleText>
                  <span>Important Note:</span> Becoming a Satellite offers the operation an oracle node. Technically,
                  one may become a Satellite without operating an oracle and take part in Governance. However, they will
                  forgo all of the oracle rewards which are a major source of payments. For information on operating an
                  oracle node for your Satellite, please read more on Gitbook{' '}
                  <CustomLink
                    to="https://docs.mavryk.finance/mavryk-finance/satellites-and-oracles/oracle-nodes"
                    styling={{ underline: true }}
                  >
                    here
                  </CustomLink>
                </BecomeSatelliteOracleText>
                <Switch>
                  <ProtectedRoute
                    exact
                    path={`/become-satellite/${SATELLITE_TAB_DETAILS}`}
                    isAuthorized={Boolean(userAddress)}
                    hasAccess={Boolean(isSatellite) && Boolean(usersSatelliteProfile)}
                    redirectPath={`/become-satellite/${SATELLITE_TAB_EDIT}`}
                    component={() => (
                      // need this ts off, cuz we check for this params beeing present with isAuthorized & hasAccess inside ProtectedRoute TODO: mb find a solution for this
                      // @ts-expect-error
                      <SatelliteDetailsScreen usersSatelliteProfile={usersSatelliteProfile} satelliteId={userAddress} />
                    )}
                  />
                  <Route exact path={`/become-satellite/${SATELLITE_TAB_EDIT}`}>
                    <BecomeSatelliteScreen
                      usersSatelliteProfile={usersSatelliteProfile}
                      userSmvkBalance={userSmvkBalance}
                    />
                  </Route>

                  <Redirect to={`/become-satellite/${SATELLITE_TAB_EDIT}`} />
                </Switch>
              </BecomeSatelliteForm>
            )}
          </div>
          <SatellitesSideBar isButton={false} />
        </PageContent>
      </Page>
    </>
  )
}
