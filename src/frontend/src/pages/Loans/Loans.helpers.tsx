import { Lending_Controller } from 'utils/generated/graphqlTypes'

export const normalizeLoans = (storage: Lending_Controller) => {
  return {
    loanAssets: ['XTZ', 'EURL', 'USDT'],
  }
}
