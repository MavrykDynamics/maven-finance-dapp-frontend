import { useMemo, useState } from 'react'
import Select, { ActionMeta, FormatOptionLabelMeta } from 'react-select'

// consts
import { MULTISELECT_SELECT_ALL_OPTION_VALUE, getMultiselectStyling } from './Multiselect.consts'
import colors from 'styles/colors'

// types
import { MultiselectItemType, MultiselectProps } from './Multiselect.types'

// hooks
import { useDappConfigContext } from 'providers/DappConfigProvider/dappConfig.provider'

// view
import Checkbox from '../Checkbox/Checkbox.view'
import { ImageWithPlug } from '../Icon/ImageWithPlug'
import {
  CustomControlComponent,
  MultiselectBackdropStyled,
  MultiselectHeaderStyled,
  MultiselectMenuStyled,
  MultiselectOptionStyled,
  MultiselectOptionTagStyled,
  // MultiselectOptionsPlaceholderStyled,
  MultiselectStyled,
} from './Multiselect.style'
import Icon from '../Icon/Icon.view'
import classNames from 'classnames'

export const Multiselect = <ItemType extends MultiselectItemType = MultiselectItemType>({
  options,
  selectedOptions,
  selectHandler,
  // selectAllHandler,
  disabled,
  placeholder,
  // search props
  withSearch,
  searchPlaceholder,
  searchHandler,
}: MultiselectProps<ItemType>) => {
  const {
    preferences: { themeSelected },
  } = useDappConfigContext()
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (newSelectedOptions: ReadonlyArray<ItemType>, actionMeta: ActionMeta<ItemType>) => {
    const { action, option, removedValue } = actionMeta

    const isAllClicked =
      (option && option.value === MULTISELECT_SELECT_ALL_OPTION_VALUE) ||
      (removedValue && removedValue.value === MULTISELECT_SELECT_ALL_OPTION_VALUE)

    // click on all option
    if (isAllClicked) {
      // select all option
      if (action === 'select-option') {
        return selectHandler(options, actionMeta)
      }
      // deselect all option (remove-value is click on 'x' in header)
      else if (action === 'deselect-option' || action === 'remove-value') {
        return selectHandler([], actionMeta)
      }
    }

    // check whether we have selected all options (need to filter out 'all' cuz it's 'fake' option)
    const isAllOptionsSelected =
      newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length +
        (action === 'select-option' ? 0 : 1) ===
      options.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE).length

    console.log({ isAllOptionsSelected, action, newSelectedOptions, options })

    if (isAllOptionsSelected) {
      // when we selected last non-selected option, we need to mark 'all' as selected too
      if (action === 'select-option') {
        return selectHandler(
          newSelectedOptions.concat(options.find(({ value }) => value === MULTISELECT_SELECT_ALL_OPTION_VALUE) ?? []),
          actionMeta,
        )
      }
      // if we have selected all options, and we deselect one option, we need to remove selection from 'all'
      else if (action === 'deselect-option' || action === 'remove-value') {
        console.log({
          newSelectedOptions,
          nnn: newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE),
        })
        return selectHandler(
          newSelectedOptions.filter(({ value }) => value !== MULTISELECT_SELECT_ALL_OPTION_VALUE),
          actionMeta,
        )
      }
    }

    // perform regular select handling
    selectHandler(newSelectedOptions, actionMeta)
  }

  // custom checked for selected option state, need it cuz of 'all' option functionality
  const checkWhetherOptionIsSelected = (option: ItemType) =>
    Boolean(selectedOptions.find(({ value }) => value === option.value))

  // custom components for options
  const formatOptionLabel = (option: ItemType, multiSelectContext: FormatOptionLabelMeta<ItemType>) => {
    // styled component for option inside menu
    if (multiSelectContext.context === 'menu') {
      const isOptionSelected = Boolean(multiSelectContext.selectValue.find(({ value }) => value === option.value))
      return (
        <MultiselectOptionStyled>
          <Checkbox checked={isOptionSelected} onChangeHandler={() => null} id={option.value} />{' '}
          {option.image ? <ImageWithPlug imageLink={option.image} noImageIconId="no-image" alt={''} /> : null}{' '}
          <div className="option-text">{option.label}</div>
        </MultiselectOptionStyled>
      )
    }

    // styled component for selected option (tag) inside header (control)
    if (multiSelectContext.context === 'value') {
      return (
        <MultiselectOptionTagStyled>
          {option.image ? <ImageWithPlug imageLink={option.image} noImageIconId="no-image" alt={''} /> : null}{' '}
          <div className="option-text">{option.label}</div>
        </MultiselectOptionTagStyled>
      )
    }

    return option.label
  }

  const multiselectStyledStyles = useMemo(() => getMultiselectStyling<ItemType>(colors[themeSelected]), [themeSelected])

  const handleClearAll = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    selectHandler([])
  }

  const handleUnselectOption = (e: React.MouseEvent<HTMLDivElement>, optionValue: string) => {
    e.stopPropagation()

    selectHandler(selectedOptions.filter(({ value }) => value !== optionValue))
  }

  return (
    <MultiselectStyled>
      <MultiselectHeaderStyled onClick={() => setIsOpen(!isOpen)}>
        {selectedOptions.length > 0 ? (
          <div className="selected-options-list">
            {selectedOptions.map((option) => {
              return (
                <MultiselectOptionTagStyled onClick={(e) => handleUnselectOption(e, option.value)}>
                  {option.image ? <ImageWithPlug imageLink={option.image} noImageIconId="no-image" alt={''} /> : null}{' '}
                  <div className="option-text">{option.label}</div>
                  <div className="unselect-option">
                    <Icon id="navigation-menu_close" />
                  </div>
                </MultiselectOptionTagStyled>
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
              isOptionSelected={checkWhetherOptionIsSelected}
              formatOptionLabel={formatOptionLabel}
              components={{
                Control: CustomControlComponent,
              }}
              options={options}
              value={selectedOptions}
              styles={multiselectStyledStyles}
            />
          </MultiselectMenuStyled>
        </>
      ) : null}

      {/* <Select
        value={selectedOptions}
        onChange={handleSelect}
        options={options}
        isOptionSelected={checkWhetherOptionIsSelected}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={withSearch}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        menuShouldScrollIntoView
        openMenuOnClick
        controlShouldRenderValue
        styles={multiselectStyledStyles}
        classNames={{
          menuList: () => 'scroll-block',
          dropdownIndicator: (props) => (props.selectProps.menuIsOpen ? 'menu-open' : ''),
        }}
        isMulti
      /> */}
    </MultiselectStyled>
  )
}
