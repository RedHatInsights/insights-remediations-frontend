import React from 'react';
import {
  MenuToggle,
  MenuToggleStatus,
  Select,
  SelectOption,
  SelectList,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import propTypes from 'prop-types';

export const PlaybookSelect = ({
  isSelectOpen,
  selected,
  inputValue,
  selectOptions,
  focusedItemIndex,
  activeItemId,
  textInputRef,
  isLoadingRemediationsList,
  exceedsLimits,
  onToggleClick,
  onInputClick,
  onSelect,
  onTextInputChange,
  onInputKeyDown,
  handleClear,
  closeMenu,
  createItemId,
}) => {
  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      onClick={onToggleClick}
      isExpanded={isSelectOpen}
      isFullWidth
      aria-label="Typeahead creatable menu toggle"
      status={exceedsLimits ? MenuToggleStatus.warning : undefined}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="create-typeahead-select-input"
          autoComplete="off"
          placeholder={
            isLoadingRemediationsList
              ? 'Loading remediation plans...'
              : 'Enter or select'
          }
          innerRef={textInputRef}
          isDisabled={isLoadingRemediationsList}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isSelectOpen}
          aria-controls="select-create-typeahead-listbox"
        />
        <TextInputGroupUtilities
          {...(!inputValue ? { className: 'pf-v6-u-display-none' } : {})}
        >
          <Button
            variant="plain"
            onClick={handleClear}
            aria-label="Clear input value"
            icon={<TimesIcon />}
          />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="create-typeahead-select"
      isOpen={isSelectOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => {
        !isOpen && closeMenu();
      }}
      toggle={toggle}
      variant="typeahead"
      isScrollable
    >
      <SelectList id="select-create-typeahead-listbox">
        {isLoadingRemediationsList ? (
          <SelectOption isDisabled>Loading plans...</SelectOption>
        ) : selectOptions.length === 0 ? (
          <SelectOption isDisabled>No plans found</SelectOption>
        ) : (
          selectOptions.map((option, index) => (
            <SelectOption
              key={option.value || option.children}
              value={option.value}
              isFocused={focusedItemIndex === index}
              id={createItemId(option.value)}
              ref={null}
            >
              {option.children}
            </SelectOption>
          ))
        )}
      </SelectList>
    </Select>
  );
};

PlaybookSelect.propTypes = {
  isSelectOpen: propTypes.bool.isRequired,
  selected: propTypes.string.isRequired,
  inputValue: propTypes.string.isRequired,
  selectOptions: propTypes.array.isRequired,
  focusedItemIndex: propTypes.number,
  activeItemId: propTypes.string,
  textInputRef: propTypes.object.isRequired,
  isLoadingRemediationsList: propTypes.bool.isRequired,
  exceedsLimits: propTypes.bool.isRequired,
  onToggleClick: propTypes.func.isRequired,
  onInputClick: propTypes.func.isRequired,
  onSelect: propTypes.func.isRequired,
  onTextInputChange: propTypes.func.isRequired,
  onInputKeyDown: propTypes.func.isRequired,
  handleClear: propTypes.func.isRequired,
  closeMenu: propTypes.func.isRequired,
  createItemId: propTypes.func.isRequired,
};
