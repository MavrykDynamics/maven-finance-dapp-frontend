export const getVaultSimpleStatus = (collateralRatio: number): { text: string; status: string } => {
  return collateralRatio >= 200
    ? { text: 'Low Risk', status: 'low' }
    : collateralRatio <= 150
    ? { text: 'High Risk', status: 'hight' }
    : { text: 'At Risk', status: 'risk' }
}
