/**
 * Legacy Farm types used by the RoiCalculator component.
 *
 * NOTE: The RoiCalculator is currently a dead feature (commented out in FarmsPopupsProvider).
 * These types exist to allow the file to compile without @ts-nocheck.
 * When the ROI calculator is revived, these should be replaced with FarmRecordType
 * from providers/FarmsProvider/farms.provider.types and property names updated.
 */

export type FarmStorageItem = {
  address: string
  currentRewardPerBlock: number
  lpBalance: number
  lpTokenAddress: string
  totalBlocks: number
  lpToken1: { symbol: string; thumbnailUri?: string; address: string }
  lpToken2: { symbol: string; thumbnailUri?: string; address: string }
}

export type FarmStorage = FarmStorageItem[]
