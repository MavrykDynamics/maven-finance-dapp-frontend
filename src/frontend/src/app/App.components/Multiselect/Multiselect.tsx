import { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import Select, { ActionMeta, FormatOptionLabelMeta, ControlProps, GroupBase } from 'react-select'
import { FilterOptionOption } from 'react-select/dist/declarations/src/filters'

// consts
import {
  MULTISELECT_ACTION_DESELECT,
  MULTISELECT_ACTION_REMOVE,
  MULTISELECT_ACTION_SELECT,
  MULTISELECT_SELECT_ALL_OPTION_VALUE,
} from './Multiselect.consts'
import colors from 'styles/colors'

// utils
import { getMultiselectStyling } from './Multiselect.utils'

// types
import { MultiselectItemType, MultiselectProps } from './Multiselect.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// view
import Checkbox from '../Checkbox/Checkbox.view'
import Icon from '../Icon/Icon.view'
import { ImageWithPlug } from '../Icon/ImageWithPlug'
import { SpinnerCircleLoaderStyled } from '../Loader/Loader.style'
import {
  MultiselectBackdropStyled,
  MultiselectHeaderStyled,
  MultiselectMenuStyled,
  MultiselectMenuOptionStyled,
  MultiselectHeaderOptionStyled,
  MultiselectOptionsControlStyled,
  MultiselectStyled,
} from './Multiselect.style'

// Custom controll (header) for select, shown as search
const CustomControlComponent = <ItemType extends MultiselectItemType>({
  selectProps,
}: ControlProps<ItemType, true, GroupBase<ItemType>>) => {
  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    selectProps.onInputChange(value, {
      action: 'input-change',
      prevInputValue: selectProps.inputValue,
    })
  }
  return (
    <MultiselectOptionsControlStyled>
      <Icon id="search" />
      <input type="search" placeholder="Search option" value={selectProps.inputValue} onChange={inputOnChange} />
    </MultiselectOptionsControlStyled>
  )
}

const ReactSelectReplacedComponents = {
  Control: CustomControlComponent,
}

/**
 *
 * @param options -> options that will be shown in menu
 * @param selectedOptions -> options that are selected, shown in header, and marked ass selected in menu
 * @param selectHandler -> handler click on option in menu
 * @param disabled -> is multiselect disabled
 * @param placeholder -> placeholder for header
 * @param searchHandler -> how to filter options on typing in search input, by default filtering by label field
 * @returns multiselect component
 *
 * NOTE:
 *    - component is generic cuz search might require searching by some other additional fields
 *    - cuz of generic option type, we need to handle 'all' option outside the multiselect, just add it before all options to the array, OPTION 'all' SHOULD HAVE value: MULTISELECT_SELECT_ALL_OPTION_VALUE, all other fields are as you want
 */
export const Multiselect = <ItemType extends MultiselectItemType = MultiselectItemType>({
  options,
  selectedOptions,
  selectHandler,
  disabled,
  isLoading,
  placeholder,
  searchHandler,
}: MultiselectProps<ItemType>) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = useCallback(
    (newSelectedOptions: ReadonlyArray<ItemType>, actionMeta: ActionMeta<ItemType>) => {
      const { action, option, removedValue } = actionMeta

      const isAllOptionClicked =
        (option && option.value === MULTISELECT_SELECT_ALL_OPTION_VALUE) ||
        (removedValue && removedValue.value === MULTISELECT_SELECT_ALL_OPTION_VALUE)

      const totalOptionsAmount = options.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length
      const newSelectedOptionsAmount = newSelectedOptions.filter(
        ({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE,
      ).length

      // select option in dd menu
      if (action === MULTISELECT_ACTION_SELECT) {
        // if we clicked 'all' option -> select all
        if (isAllOptionClicked) return selectHandler(options, actionMeta)

        // if we clicked on option, and it was last non-selected option, select all automatically
        if (totalOptionsAmount === newSelectedOptionsAmount) {
          const optionAll = options.find(({ value }) => value === MULTISELECT_SELECT_ALL_OPTION_VALUE)

          return selectHandler(
            // need to use as to keep 'all' option on the 1st place
            optionAll ? [optionAll, ...newSelectedOptions] : newSelectedOptions,
            actionMeta,
          )
        }
      }

      // deselect option in dd menu or remove option in control block
      if (action === MULTISELECT_ACTION_DESELECT || action === MULTISELECT_ACTION_REMOVE) {
        // if click on all, remove selection from all options
        if (isAllOptionClicked) return selectHandler([], actionMeta)

        // if we HAD selected all options, and we deselected one, need to deselect all option also
        // newSelectedOptionsAmount + 1, cuz newSelectedOptionsAmount has already applied deleselect operation
        if (totalOptionsAmount === newSelectedOptionsAmount + 1)
          return selectHandler(
            newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE),
            actionMeta,
          )
      }

      // perform regular select handling
      selectHandler(newSelectedOptions, actionMeta)
    },
    [options, selectHandler],
  )

  // handling custom search functionality
  const filterOption = useCallback(
    (option: FilterOptionOption<ItemType>, inputValue: string) =>
      searchHandler?.(option.data, inputValue) ?? option.label.toLowerCase().includes(inputValue.toLowerCase()),
    [searchHandler],
  )

  // custom checked for selected option state, need it cuz of 'all' option functionality
  const checkWhetherOptionIsSelected = useCallback(
    (option: ItemType) => Boolean(selectedOptions.find(({ value }) => value === option.value)),
    [selectedOptions],
  )

  // custom components for options
  const formatOptionLabel = useCallback((option: ItemType, multiSelectContext: FormatOptionLabelMeta<ItemType>) => {
    // styled component for option inside menu
    if (multiSelectContext.context === 'menu') {
      const isOptionSelected = Boolean(multiSelectContext.selectValue.find(({ value }) => value === option.value))
      return (
        <MultiselectMenuOptionStyled>
          <Checkbox checked={isOptionSelected} id={option.value} />
          {option.image ? <ImageWithPlug imageLink={option.image} alt={`${option.label} image`} /> : null}
          <div className="option-text">{option.label}</div>
        </MultiselectMenuOptionStyled>
      )
    }

    return option.label
  }, [])

  const handleClearAll = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      selectHandler([])
    },
    [selectHandler],
  )

  const handleUnselectOption = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, optionValue: string) => {
      e.stopPropagation()
      const isAllSelected =
        options.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length ===
        selectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length

      // if "all" option pressed
      if (optionValue === MULTISELECT_SELECT_ALL_OPTION_VALUE) {
        selectHandler([])
      } else {
        selectHandler(
          selectedOptions.filter(({ value }) =>
            // If selected all options and we removing one, remove "all" option also
            isAllSelected
              ? value !== optionValue && value !== MULTISELECT_SELECT_ALL_OPTION_VALUE
              : value !== optionValue,
          ),
        )
      }
    },
    [options, selectHandler, selectedOptions],
  )

  const multiselectStyledStyles = useMemo(() => getMultiselectStyling<ItemType>(colors[themeSelected]), [themeSelected])

  return (
    <MultiselectStyled className={classNames({ disabled })}>
      <MultiselectHeaderStyled onClick={() => setIsOpen(!isOpen)} className={classNames({ isOpen })}>
        {isLoading ? (
          <div className="loader">
            <SpinnerCircleLoaderStyled /> Loading options
          </div>
        ) : selectedOptions.length > 0 ? (
          <div className="selected-options-list">
            {selectedOptions.map((option) => {
              return (
                <MultiselectHeaderOptionStyled onClick={(e) => handleUnselectOption(e, option.value)}>
                  <div className="option-text">{option.label}</div>
                  <div className="unselect-option">
                    <Icon id="navigation-menu_close" />
                  </div>
                </MultiselectHeaderOptionStyled>
              )
            })}
          </div>
        ) : (
          <div className="placeholder">{placeholder}</div>
        )}
        <div className="controls">
          <div className="clear-all" onClick={handleClearAll}>
            <Icon id="navigation-menu_close" />
          </div>
          <div className="separator" />
          <div className={classNames('open-status', { isOpen })}>
            <Icon id="simple-arrow-down" />
          </div>
        </div>
      </MultiselectHeaderStyled>

      {isOpen ? (
        <>
          <MultiselectBackdropStyled onClick={() => setIsOpen(false)} />
          <MultiselectMenuStyled>
            <div className="space" />
            <Select
              backspaceRemovesValue={false}
              controlShouldRenderValue={false}
              hideSelectedOptions={false}
              closeMenuOnSelect={false}
              isClearable={false}
              tabSelectsValue={false}
              // menuIsOpen cuz we controll showing menu in useState
              menuIsOpen
              isMulti
              onChange={handleSelect}
              filterOption={filterOption}
              isOptionSelected={checkWhetherOptionIsSelected}
              formatOptionLabel={formatOptionLabel}
              components={ReactSelectReplacedComponents}
              options={options}
              value={selectedOptions}
              styles={multiselectStyledStyles}
            />
          </MultiselectMenuStyled>
        </>
      ) : null}
    </MultiselectStyled>
  )
}
