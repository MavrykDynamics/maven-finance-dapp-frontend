import { CouncilActionParamsNames, CouncilsActionsIds } from 'providers/CouncilProvider/helpers/council.types'

export type CouncilContractsMultiselectOptionType = {
  value: string
  address: string
  label: string
}

export type CouncilActionsParamsColumnsType = Partial<
  Record<
    CouncilsActionsIds,
    Partial<
      Record<
        CouncilActionParamsNames,
        {
          className: string
          cellName: string
          type: 'number' | 'address' | 'image' | 'url' | 'default'
          suffix?: string
        }
      >
    >
  >
>

export type CouncilActionParamCellType = Array<{
  paramName: string
  cellName: string
  className: string
  value: string
  valueContent: React.ReactNode
}>
