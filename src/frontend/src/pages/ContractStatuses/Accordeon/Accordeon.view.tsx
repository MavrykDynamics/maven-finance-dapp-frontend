import { useMemo } from 'react'
import Icon from 'app/App.components/Icon/Icon.view'
import { Truncate } from 'app/App.style'
import { AccordionContent, AccordionItem, AccordionToggler, AccordionWrapper } from './Accordeon.style'
import { getEntrypointText } from './accordeon.helpers'

type AccordionViewProps = {
  accordionId: string
  isExpanded: boolean
  methods: Record<string, boolean>
  accordionClickHandler: (accId: string) => void
}

export const BGAccordion = ({ methods, accordionClickHandler, accordionId, isExpanded }: AccordionViewProps) => {
  const methodsList = useMemo(
    () =>
      methods
        ? Object.keys(methods).map((item) => ({
            methodName: getEntrypointText(item),
            method: item,
          }))
        : [],
    [methods],
  )

  return (
    <AccordionWrapper>
      <AccordionToggler onClick={() => accordionClickHandler(accordionId)}>
        Entrypoints {<Icon className={`accordion-icon ${isExpanded ? '' : 'down'}`} id="accordion_icon" />}
      </AccordionToggler>
      <AccordionContent className={`scroll-block ${isExpanded ? 'expanded' : ''}`}>
        {methodsList.map((item) => (
          <AccordionItem key={item.method} $status={methods[item.method]}>
            <Truncate>{item.methodName}</Truncate>
          </AccordionItem>
        ))}
      </AccordionContent>
    </AccordionWrapper>
  )
}
