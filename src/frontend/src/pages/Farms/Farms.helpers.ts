/**
 * Legacy helper functions used by the RoiCalculator component.
 *
 * NOTE: The RoiCalculator is currently a dead feature (commented out in FarmsPopupsProvider).
 * These are thin wrappers around the provider utility functions to satisfy the import.
 * When the ROI calculator is revived, import directly from providers/FarmsProvider/helpers/farms.utils.
 */
import { calculateFarmAPR, calculateFarmAPY } from 'providers/FarmsProvider/helpers/farms.utils'

const BLOCKS_PER_YEAR = 1051200

export const calculateAPR = (currentRewardPerBlock: number, totalBlocks: number, lpBalance: number): number =>
  calculateFarmAPR(currentRewardPerBlock, totalBlocks, lpBalance)

export const calculateAPY = (currentRewardPerBlock: number, lpBalance: number): number =>
  calculateFarmAPY(currentRewardPerBlock, lpBalance)

export const getUserBalanceByAddressOld = async (_lpTokenAddress?: string): Promise<number> => {
  // Legacy function — wallet interaction removed during Redux→Context migration.
  // Returns 0 until the ROI calculator feature is revived with proper provider integration.
  return 0
}
