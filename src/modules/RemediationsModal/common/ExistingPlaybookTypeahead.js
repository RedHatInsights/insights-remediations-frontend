import React, { useEffect, useRef, useState } from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import propTypes from 'prop-types';
import { EXISTING_PLAYBOOK } from '../../../Utilities/utils';
import { getRemediation } from '../../../api';

const ExistingPlaybookTypeahead = ({
  selectedPlaybook,
  setIsLoadingRemediation,
  setSelectedPlaybook,
  existingPlaybookSelected,
  existingRemediations,
  input,
  formOptions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedPlaybook?.name);
  const [filterValue, setFilterValue] = useState('');
  const [selectOptions, setSelectOptions] = useState(existingRemediations);
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const textInputRef = useRef();

  useEffect(() => {
    let newSelectOptions = existingRemediations;
    if (filterValue) {
      newSelectOptions = existingRemediations.filter((menuItem) =>
        String(menuItem.name).toLowerCase().includes(filterValue.toLowerCase())
      );

      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            name: `No results found for "${filterValue}"`,
          },
        ];
      }

      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, value) => {
    setIsLoadingRemediation(true);
    getRemediation(value).then((remediation) => {
      setSelectedPlaybook(remediation);
      setIsLoadingRemediation(false);
      if (existingPlaybookSelected) {
        setInputValue(remediation.name);
        setFilterValue('');
        input.onChange(remediation.name);
        formOptions.change(EXISTING_PLAYBOOK, remediation);
      }
    });
  };

  const onTextInputChange = (_event, value) => {
    setFilterValue(value);
    setInputValue(value);
  };

  const handleMenuArrowKeys = (key) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        if (
          focusedItemIndex === null ||
          focusedItemIndex === selectOptions.length - 1
        ) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[
        indexToFocus
      ];

      setActiveItem(`select-typeahead-${focusedItem.name.replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event) => {
    const enabledMenuItems = selectOptions.filter(
      (option) => !option.isDisabled
    );
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex
      ? enabledMenuItems[focusedItemIndex]
      : firstMenuItem;
    switch (event.key) {
      case 'Enter':
        if (isOpen && !focusedItem.name.includes('No results found for')) {
          onSelect(null, focusedItem.id);
        }
        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder="Select playbook"
          {...(activeItem && {
            'aria-activedescendant': activeItem,
          })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id="typeahead-select-existing-playbook"
      isOpen={isOpen}
      selected={selectedPlaybook?.name}
      onSelect={onSelect}
      onOpenChange={() => {
        setIsOpen(false);
      }}
      toggle={toggle}
      isScrollable
    >
      <SelectList id="select-typeahead-listbox">
        {selectOptions.map((remediation, index) => {
          return (
            <SelectOption
              key={remediation.id}
              value={remediation.id}
              isFocused={focusedItemIndex === index}
              id={remediation.id}
            >
              {remediation.name}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

ExistingPlaybookTypeahead.propTypes = {
  selectedPlaybook: propTypes.object,
  setIsLoadingRemediation: propTypes.func,
  setSelectedPlaybook: propTypes.func,
  existingPlaybookSelected: propTypes.bool,
  existingRemediations: propTypes.array,
  input: propTypes.object,
  formOptions: propTypes.object,
};

export default ExistingPlaybookTypeahead;
