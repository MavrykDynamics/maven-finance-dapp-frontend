import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import qs from 'qs'

import { Input } from 'app/App.components/Input/Input.controller'
import Icon from '../Icon/Icon.view'

import { PaginationArrow, PaginationWrapper } from './Pagination.style'

import { LIST_NAMES_MAPPER, PaginationProps, PAGINATION_SIDE_RIGHT, updatePageInUrl } from './pagination.consts'
import { formatNumber } from '../CommaNumber/CommaNumber.controller'

const Pagination = ({
  itemsCount,
  side = PAGINATION_SIDE_RIGHT,
  listName,
  className,
  disabled = false,
}: PaginationProps) => {
  const { pathname, search } = useLocation()
  const { page = {}, ...rest } = qs.parse(search, { ignoreQueryPrefix: true })

  // @ts-ignore
  const currentPage = page?.[listName] || 1
  const pagesCount = Math.ceil(itemsCount / LIST_NAMES_MAPPER[listName])

  const [inputValue, setInputValue] = useState(currentPage)
  const navigate = useNavigate()

  const generateNewUrl = (newPage: number) => updatePageInUrl({ page, newPage, listName, pathname, restQP: rest })

  useEffect(() => {
    setInputValue(currentPage)
  }, [currentPage])

  return pagesCount > 1 ? (
    <PaginationWrapper className={className} $side={side} $disabled={disabled}>
      Page
      <div className="input_wrapper">
        <Input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (+e.target.value <= pagesCount) {
              setInputValue(e.target.value)
            }
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if ((!inputValue && e.key === '0') || e.key === '-') e.preventDefault()
            if (e.key === 'Enter') navigate(generateNewUrl(inputValue))
          }}
          onBlur={() => {
            if (!inputValue && !inputValue !== currentPage) setInputValue(currentPage)
          }}
          type={'number'}
          value={inputValue}
        />
      </div>
      of {formatNumber({ number: pagesCount })} items
      <PaginationArrow
        $isDisabled={+currentPage === 1}
        onClick={() => {
          if (currentPage > 1) {
            navigate(generateNewUrl(currentPage - 1))
          }
        }}
      >
        <Icon id="paginationArrowLeft" />
      </PaginationArrow>
      <PaginationArrow
        $isDisabled={+currentPage === +pagesCount}
        $isRight
        onClick={() => {
          if (currentPage < pagesCount) {
            navigate(generateNewUrl(+currentPage + 1))
          }
        }}
      >
        <Icon id="paginationArrowLeft" />
      </PaginationArrow>
    </PaginationWrapper>
  ) : null
}

export default Pagination
