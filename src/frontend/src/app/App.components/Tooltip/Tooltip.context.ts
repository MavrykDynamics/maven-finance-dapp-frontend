import React, { useRef } from 'react'
import {
  Placement,
  useFloating,
  autoUpdate,
  offset,
  flip,
  arrow,
  shift,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  useHover,
} from '@floating-ui/react'

export interface TooltipOptions {
  placement?: Placement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type TooltipContextType = ReturnType<typeof useTooltip> | null
export const TooltipContext = React.createContext<TooltipContextType>(null)

export const useTooltip = ({
  placement = 'top',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TooltipOptions = {}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = setControlledOpen ?? setUncontrolledOpen

  const arrowRef = useRef<null | SVGSVGElement>(null)

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      arrow({
        element: arrowRef,
      }),
      offset(5),
      flip({
        crossAxis: placement.includes('-'),
        fallbackAxisSideDirection: 'start',
        padding: 5,
      }),
      shift({ padding: 5 }),
    ],
  })

  const { context } = data

  const hover = useHover(context, {
    move: false,
    delay: {
      open: 75,
      close: 100,
    },
    enabled: controlledOpen == null,
  })
  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const interactions = useInteractions([hover, focus, dismiss, role])

  return React.useMemo(
    () => ({
      open,
      setOpen,
      arrowRef,
      ...interactions,
      ...data,
    }),
    [open, setOpen, interactions, data]
  )
}

export const useTooltipContext = () => {
  const context = React.useContext(TooltipContext)

  if (!context) throw new Error('Tooltip components must be wrapped in <Tooltip />')

  return context
}
