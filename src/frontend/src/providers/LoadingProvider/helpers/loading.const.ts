import { LoadingState } from '../loading.provider.types';

  
  export const defaultLoadingState: LoadingState = {
    // isWertLoading – used for wert io payment system initialization
    isWertLoading: false,
    // isActiveFullScreenLoader – used for full screen rocket loader after operation confirmed
    isActiveFullScreenLoader: false,
    // isActionActive – user to track whether action is fullfilled with data update and we can unlock buttons
    isActionActive: false,
  }