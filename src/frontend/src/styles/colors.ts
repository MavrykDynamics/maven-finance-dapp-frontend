import { LIGHT_THEME, DARK_THEME, SPACE_THEME, ThemeType } from 'consts/theme.const'

const cyanColor = '#86d4c9'

export const dark = {
  // primary colors
  selectedColor: '#8D86EB',
  selectedColorSecondary: '#8D86EB',
  linksAndButtons: '#88D1C3',
  backgroundColor: '#121212',
  cards: '#1E1E1E',
  mainHeadingText: '#EBF0FF',
  subHeadingText: '#BBBBBB',
  primaryText: '#EBF0FF',
  menuButtonText: '#D2D2D2',
  menuButtonSelected: '#8D86EB',
  placeholders: '#C0DBFF',
  regularText: '#BBBBBB',
  strokeColor: '#505050',
  divider: '#505050',
  messagesBackground: '#1E1E1E',
  tooltipTextBg: '#2E2E2E',
  strokeCards: '#505050',
  footerColor: '#121212',
  strokeForForms: '#8D86EB',
  // secondary colors
  infoColor: '#00C2FF',
  upColor: '#34F66A',
  downColor: '#FF4343',
  neutralColor: '#77A4F2',
  neutralSecondaryColor: '#6A6A9B',
  warningColor: '#FE630C',
  riskColor: '#FBFF43',
  // background secondary colors
  upBgColor: 'rgba(52, 246, 106, 0.2)',
  downBgColor: 'rgba(255, 67, 67, 0.2)',
  neutralBgColor: 'rgba(119, 164, 242, 0.2)',
  // specific colors
  coralColor: '#FF8080',
  inputFocusColor: '#7068AA',
  ipfsBorderColor: 'rgb(80, 62, 170)',
  ipfsHoverBorderColor: '%2386D4C9FF',
  menuBackdropColor: '#12121280',
  menuBackgroundActiveColor: 'linear-gradient(90deg, #38237c 0%, rgba(80, 80, 142, 0) 100%)',
  popupBackdropColor: '#0000007a',
  pageHeaderColor: '#FFFFFF',
  scrollBlockColor: '#8D86EB',
  cardHoverColor: 'rgba(134, 212, 201, 0.5)',
  rpcNodeSelecledColor: '#86D4C9',
  roiCalculatorBackground: 'linear-gradient(180deg, #503eaa 0%, rgba(80, 62, 170, 0) 100%)',
  dashboardTvlBackground: 'linear-gradient(180deg, #1E1E1E 3.55%, #1E1E1E 83.47%, #1E1E1E 103.84%)',
  // chart colors
  primaryChartColor: '#77A4F2',
  primaryChartTopColor: 'rgba(119, 164, 242, 0.7)',
  primaryChartBottomColor: 'rgba(119, 164, 242, 0.01)',
  secondaryChartColor: '#86D4C9',
  secondaryChartTopColor: 'rgba(134,212,201, 0.7)',
  secondaryChartBottomColor: 'rgba(134,212,201, 0.01)',
  histogramChartColor: '#77A4F2',
  gaugeChartArcColor: '#86D4C9',
  gaugeChartCircleBackgroundColor: '#1E1E1E',
  gradientDiagramBackgroundColor: '#696969',
  // loader colors
  shineAnimationGradient: `linear-gradient(to right, #8D86EB 0, #86D4C9 10%, #8D86EB 20%)`,
  loaderBackgroundColor: 'rgba(8, 6, 40, 1)',
  primaryBtnSpinnerColor: '#0000007a',
  // tab colors
  forTabs: 'linear-gradient(90deg, #86D4C9 0.31%, #8D86EB 99.97%)',
  // const colors
  cyanColor,
  // disabled colors
  buttonDisabled: '#5A5A6E',
}

export const light = {
  // primary colors
  selectedColor: '#03C9A3',
  selectedColorSecondary: '#8D86EB',
  linksAndButtons: '#8D86EB',
  backgroundColor: '#F7F9FD',
  cards: '#FFFFFF',
  mainHeadingText: '#1F1F1F',
  subHeadingText: '#5B616E',
  primaryText: '#1F1F1F',
  menuButtonText: '#4C4C4C',
  menuButtonSelected: '#86D4C9',
  placeholders: '#8D86EB',
  regularText: '#5B616E',
  strokeColor: '#00000033',
  divider: '#00000033',
  messagesBackground: '#E1E6FF',
  tooltipTextBg: '#E1E6FF',
  strokeCards: '#00000033',
  footerColor: '#FFFFFF',
  strokeForForms: '#1F1F1F',
  // secondary colors
  infoColor: '#3F8BEF',
  upColor: '#27AE60',
  downColor: '#FF4343',
  neutralColor: '#6F50B5',
  neutralSecondaryColor: '#6A6A9B',
  warningColor: '#FE630C',
  riskColor: '#FBBA39',
  // background secondary colors
  upBgColor: 'rgba(52, 246, 106, 0.2)',
  downBgColor: 'rgba(255, 67, 67, 0.2)',
  neutralBgColor: 'rgba(119, 164, 242, 0.2)',
  // specific colors
  coralColor: '#FF8080',
  inputFocusColor: '#7068AA',
  ipfsBorderColor: 'rgb(31, 31, 31)',
  ipfsHoverBorderColor: '%238D86EBFF',
  menuBackdropColor: '#F7F9FD80',
  menuBackgroundActiveColor: 'linear-gradient(90deg, rgba(134, 212, 201, 0.5) 0%, rgba(134, 212, 201, 0) 100%);',
  popupBackdropColor: '#0000007a',
  pageHeaderColor: '#FFFFFF',
  scrollBlockColor: '#8D86EB',
  cardHoverColor: 'rgba(134, 212, 201, 0.5)',
  rpcNodeSelecledColor: '#8D86EB',
  roiCalculatorBackground: 'linear-gradient(180deg, rgba(80, 62, 170, 0.20) 0%, rgba(80, 62, 170, 0.00) 100%)',
  dashboardTvlBackground: 'linear-gradient(180deg, #FFFFFF 3.55%, #FFFFFF 83.47%, #FFFFFF 103.84%)',
  // chart colors
  primaryChartColor: '#77A4F2',
  primaryChartTopColor: 'rgba(119, 164, 242, 0.7)',
  primaryChartBottomColor: 'rgba(119, 164, 242, 0.01)',
  secondaryChartColor: '#86D4C9',
  secondaryChartTopColor: 'rgba(134,212,201, 0.7)',
  secondaryChartBottomColor: 'rgba(134,212,201, 0.01)',
  histogramChartColor: '#77A4F2',
  gaugeChartArcColor: '#86D4C9',
  gaugeChartCircleBackgroundColor: '#FFFFFF',
  gradientDiagramBackgroundColor: '#696969',
  // loader colors
  shineAnimationGradient: `linear-gradient(to right, #8D86EB 0, #86D4C9 10%, #8D86EB 20%)`,
  loaderBackgroundColor: 'rgba(8, 6, 40, 1)',
  primaryBtnSpinnerColor: '0000007a',
  // tab colors
  forTabs: 'linear-gradient(90deg, #03C9A3 0.31%, #8D86EB 99.97%)',
  // const colors
  cyanColor,
  // disabled colors
  buttonDisabled: '#5A5A6E',
}

export const space = {
  // primary colors
  selectedColor: '#8D86EB',
  selectedColorSecondary: '#503EAA',
  linksAndButtons: '#86D4C9',
  backgroundColor: '#080628',
  cards: '#160E3F',
  mainHeadingText: '#CDCDCD',
  subHeadingText: '#D0CFD9',
  primaryText: '#77A4F2',
  menuButtonText: '#86D4C9',
  menuButtonSelected: '#8D86EB',
  placeholders: '#C0DBFF',
  regularText: '#D0CFD9',
  strokeColor: '#503EAA',
  divider: '#503EAA',
  messagesBackground: '#38237C',
  tooltipTextBg: '#38237C',
  strokeCards: '#503EAA',
  footerColor: '#080628',
  strokeForForms: '#503EAA',
  // secondary colors
  infoColor: '#00C2FF',
  upColor: '#34F66A',
  downColor: '#FF4343',
  neutralColor: '#77A4F2',
  neutralSecondaryColor: '#6A6A9B',
  warningColor: '#FE630C',
  riskColor: '#FBFF43',
  // background secondary color
  upBgColor: 'rgba(52, 246, 106, 0.2)',
  downBgColor: 'rgba(255, 67, 67, 0.2)',
  neutralBgColor: 'rgba(119, 164, 242, 0.2)',
  // specific colors
  coralColor: '#FF8080',
  inputFocusColor: '#7068AA',
  ipfsBorderColor: 'rgb(80, 62, 170)',
  ipfsHoverBorderColor: '%2386D4C9FF',
  menuBackdropColor: '#08062880',
  menuBackgroundActiveColor: 'linear-gradient(90deg, #38237c 0%, rgba(80, 80, 142, 0) 100%)',
  popupBackdropColor: '#0000007a',
  pageHeaderColor: '#FFFFFF',
  scrollBlockColor: '#503EAA',
  cardHoverColor: 'rgba(134, 212, 201, 0.5)',
  rpcNodeSelecledColor: '#86D4C9',
  roiCalculatorBackground: 'linear-gradient(180deg, #503eaa 0%, rgba(80, 62, 170, 0) 100%)',
  dashboardTvlBackground: 'linear-gradient(180deg, #160e3f 3.55%, #26185c 83.47%, #321f71 103.84%)',
  // chart colors
  primaryChartColor: '#77A4F2',
  primaryChartTopColor: 'rgba(119, 164, 242, 0.7)',
  primaryChartBottomColor: 'rgba(119, 164, 242, 0.01)',
  secondaryChartColor: '#86D4C9',
  secondaryChartTopColor: 'rgba(134, 212, 201, 0.7)',
  secondaryChartBottomColor: 'rgba(134, 212, 201, 0.01)',
  histogramChartColor: '#77A4F2',
  gaugeChartArcColor: '#86D4C9',
  gaugeChartCircleBackgroundColor: '#38237C',
  gradientDiagramBackgroundColor: '#696969',
  // loader colors
  shineAnimationGradient: `linear-gradient(to right, #8D86EB 0, #86D4C9 10%, #8D86EB 20%)`,
  loaderBackgroundColor: 'rgba(8, 6, 40, 1)',
  primaryBtnSpinnerColor: '#0000007a',
  // tab colors
  forTabs: 'linear-gradient(90deg, #86D4C9 0.31%, #8D86EB 99.97%)',
  // const colors
  cyanColor,
  // disabled colors
  buttonDisabled: '#5A5A6E',
}

type Themes = {
  // all themes have same color names
  [key in ThemeType]: ThemeColorsType
}

const themes: Themes = {
  [LIGHT_THEME]: light,
  [DARK_THEME]: dark,
  [SPACE_THEME]: space,
}

export type ThemeColorsType = typeof dark
export default themes
