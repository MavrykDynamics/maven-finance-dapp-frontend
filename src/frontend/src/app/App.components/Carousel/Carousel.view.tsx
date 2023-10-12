import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react'

import { CarouselStyle, CarouselViewport, CarouselContainer, CarouselButton } from './Carousel.style'

const compareValues = (element: HTMLDivElement | null) => {
  if (element) return element.scrollWidth > element.offsetWidth

  return false
}

type Props = {
  children: React.ReactNode
  itemLength: number
}

const arrowIcon = (
  <svg>
    <use xlinkHref="/icons/sprites.svg#arrow-down" />
  </svg>
)

const options: Partial<EmblaOptionsType> = { containScroll: 'trimSnaps', dragFree: true, inViewThreshold: 1 }

const Carousel = ({ children, itemLength }: Props) => {
  const [viewportRef, embla] = useEmblaCarousel(options)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false)

  const showGradient = useMemo(
    () => compareValues(containerRef.current),
    [containerRef.current?.offsetHeight, containerRef.current?.scrollWidth],
  )

  const scrollPrev = useCallback(() => embla && embla.scrollPrev(), [embla])
  const scrollNext = useCallback(() => embla && embla.scrollNext(), [embla])

  // set initial values on carousel init
  useEffect(() => {
    if (embla) {
      embla.on('select', () => {
        setPrevBtnEnabled(embla.canScrollPrev())
        setNextBtnEnabled(embla.canScrollNext())
        setSelectedIndex(embla.selectedScrollSnap())
      })

      setPrevBtnEnabled(embla.canScrollPrev())
      setNextBtnEnabled(embla.canScrollNext())
      setSelectedIndex(embla.selectedScrollSnap())
    }
  }, [embla])

  // on children change reinit carousel
  useEffect(() => {
    if (embla) embla.reInit(options)
  }, [children])

  return (
    <CarouselStyle>
      <small className="selected">
        {selectedIndex + 1} from {itemLength}
      </small>
      <CarouselViewport ref={viewportRef}>
        <CarouselContainer ref={containerRef}>{children}</CarouselContainer>
      </CarouselViewport>

      <CarouselButton className="button--prev" onClick={scrollPrev} disabled={!prevBtnEnabled}>
        {arrowIcon}
      </CarouselButton>
      <CarouselButton className="button--next" onClick={scrollNext} disabled={!nextBtnEnabled}>
        {arrowIcon}
      </CarouselButton>

      {showGradient && prevBtnEnabled && <div className="gradient-left"></div>}
      {showGradient && nextBtnEnabled && <div className="gradient-right"></div>}
    </CarouselStyle>
  )
}

export default Carousel
