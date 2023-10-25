import React from 'react'
import { FloatingArrow, FloatingPortal, useMergeRefs } from '@floating-ui/react'

import { TooltipContext, TooltipOptions, useTooltip, useTooltipContext } from './Tooltip.context'
import { TooltipTextStyled, TooltipTriggerStyled } from './Tooltip.style'
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'
import colors from 'styles/colors'

/**
 *
 * @param children: Tooltip.Trigger & Tooltip.Content only
 * @param options settings for the tooltip, more detailed below
 *      [placement] -> placement of the tooltip: 'top' | 'left' | 'right' | 'bottom'. DEF = 'top'
 *      [open] -> open state from outside
 *      [onOpenChange] -> control open state from outside
 *
 * @returns tooltip component, that consist of trigger, and tooltip content
 *
 * NOTE:  if you want to open tooltip by click on some component, or on some specific action use open & onOpenChange to control tooltip open state from outside
 */
export const Tooltip = ({ children, ...options }: { children: React.ReactNode } & TooltipOptions) => {
  const tooltip = useTooltip(options)
  return <TooltipContext.Provider value={tooltip}>{children}</TooltipContext.Provider>
}

Tooltip.Trigger = React.forwardRef<HTMLElement, React.HTMLProps<HTMLElement> & { asChild?: boolean }>(
  function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
    const context = useTooltipContext()
    const ref = useMergeRefs([context.refs.setReference, propRef, (children as any)?.ref])

    const { className, ...propsWithoutClassName } = props

    return (
      <TooltipTriggerStyled className={className}>
        <button ref={ref} {...context.getReferenceProps(propsWithoutClassName)}>
          {children}
        </button>
      </TooltipTriggerStyled>
    )
  }
)

Tooltip.Content = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function TooltipContent(
  props,
  propRef
) {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const context = useTooltipContext()
  const ref = useMergeRefs([context.refs.setFloating, propRef])

  // if tooltip is not open return null to not keep it in the doom
  if (!context.open) return null

  const {
    arrowRef: { current: tooltipContentArrowRef },
    floatingStyles,
    placement,
    middlewareData: { shift, arrow },
    refs: {
      floating: { current: tooltipContentRef },
    },
    x,
    y,
  } = context

  const xShift = Math.abs(shift?.x ?? 0)
  const xArrow = Math.abs(arrow?.x ?? 0)
  const tooltipContentWidth = Math.abs(tooltipContentRef?.clientWidth ?? 0)
  const tooltipContentHeight = Math.abs(tooltipContentRef?.clientHeight ?? 0)
  const tooltipContentArrowHeight = Math.abs(tooltipContentArrowRef?.clientHeight ?? 0)

  // position styles for tooltip content arrow
  const floatingArrowTransform = {
    transform: 'translate(0, 0)',
    bottom: 'unset',
    right: 'unset',
    zIndex: '999',

    left:
      placement === 'top' || placement === 'bottom'
        ? `${x + xShift + xArrow}px`
        : placement === 'left'
        ? `${x + xShift + xArrow + tooltipContentWidth - 4}px`
        : `${x - xArrow - 11}px`,
    top:
      placement === 'top'
        ? `${y + tooltipContentHeight - 3}px`
        : placement === 'bottom'
        ? `${y - tooltipContentArrowHeight + 1}px`
        : `${y - tooltipContentArrowHeight + (tooltipContentHeight + tooltipContentArrowHeight) / 2}px`,
  }

  // position styles for tooltip content block
  const floatingContentTransform = {
    zIndex: '1000',
    transform:
      placement === 'top'
        ? `translate(${x}px, ${y - 2}px)`
        : placement === 'bottom'
        ? `translate(${x}px, ${y}px)`
        : placement === 'left'
        ? `translate(${x - 3}px, ${y}px)`
        : `translate(${x + 3}px, ${y}px)`,
  }

  return (
    <FloatingPortal preserveTabOrder={false}>
      <TooltipTextStyled
        ref={ref}
        style={{ ...floatingStyles, ...floatingContentTransform }}
        {...context.getFloatingProps(props)}
      />
      <FloatingArrow
        ref={context.arrowRef}
        context={context.context}
        style={{
          ...floatingStyles,
          ...floatingArrowTransform,
          fill: colors[themeSelected]['tooltipTextBg'],
        }}
      />
    </FloatingPortal>
  )
})
