import { useCallback, useMemo } from 'react'
import { BrowserRouter as Router } from 'react-router'

// components
import { ErrorFooter } from './components/ErrorFooter'

// consts
import { SPACE_THEME, ThemeType, themeSchema } from 'consts/theme.const'

// styles
import { ErrorPageWrapper, ErrorPageInner, ErrorMidHeader, ErrorParagraph } from './ErrorPage.style'
import themeColors from 'styles/colors'

// providers
import { ThemeProvider } from 'styled-components'
// types
import { getItemFromStorage } from 'utils/storage'

export const MaintancePage = () => {
  const themeSelected = useMemo(() => getItemFromStorage<ThemeType>('theme', themeSchema) || SPACE_THEME, [])

  const handleRedirect = useCallback(() => {
    window.location.assign('/')
  }, [])

  return (
    <ThemeProvider theme={themeColors[themeSelected]}>
      <ErrorPageWrapper $themeSelected={themeSelected}>
        <ErrorPageInner>
          <ErrorMidHeader>We're busy updating Maven Finance for you</ErrorMidHeader>
          <ErrorParagraph>Please check back soon</ErrorParagraph>
        </ErrorPageInner>
        <ErrorFooter themeSelected={themeSelected} handleRedirect={handleRedirect} />
      </ErrorPageWrapper>
    </ThemeProvider>
  )
}
