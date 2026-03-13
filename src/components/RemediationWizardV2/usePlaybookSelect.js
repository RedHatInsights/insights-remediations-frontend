import { useState, useRef, useEffect, useMemo } from 'react';

const CREATE_NEW = 'create';

export const usePlaybookSelect = ({
  allRemediationsData,
  isSelectOpen: initialIsSelectOpen = false,
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(initialIsSelectOpen);
  const [selected, setSelected] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const textInputRef = useRef(undefined);
  const [userCreatedOptions, setUserCreatedOptions] = useState([]);

  const isExistingPlanSelected = Boolean(
    selected && selected !== CREATE_NEW && !selected.startsWith('local-'),
  );

  const initialSelectOptions = useMemo(
    () =>
      allRemediationsData?.map((remediation) => ({
        value: remediation.id,
        children: remediation.name,
      })) || [],
    [allRemediationsData],
  );

  const [selectOptions, setSelectOptions] = useState(initialSelectOptions);

  // Update select options when data or filter changes
  useEffect(() => {
    if (!allRemediationsData) {
      setSelectOptions([]);
      return;
    }

    // Merge options from API with any user-created options (dedupe by name)
    const merged = [
      ...initialSelectOptions,
      ...userCreatedOptions.filter(
        (opt) =>
          !initialSelectOptions.some(
            (base) =>
              String(base.children).toLowerCase() ===
              String(opt.children).toLowerCase(),
          ),
      ),
    ];

    let newSelectOptions = merged;

    if (filterValue) {
      newSelectOptions = merged.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(filterValue.toLowerCase()),
      );

      // Add "Create new" option if the input doesn't match any existing option
      if (
        !merged.some(
          (option) =>
            option.children.toLowerCase() === filterValue.toLowerCase(),
        )
      ) {
        newSelectOptions = [
          ...newSelectOptions,
          {
            children: `Create new plan "${filterValue}"`,
            value: CREATE_NEW,
          },
        ];
      }

      if (!isSelectOpen) {
        setIsSelectOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [
    filterValue,
    allRemediationsData,
    isSelectOpen,
    initialSelectOptions,
    userCreatedOptions,
  ]);

  const createItemId = (value) =>
    `select-typeahead-${value?.replace(' ', '-') || 'item'}`;

  const setActiveAndFocusedItem = (itemIndex) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem?.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsSelectOpen(false);
    resetActiveAndFocusedItem();
  };

  const onToggleClick = () => {
    setIsSelectOpen(!isSelectOpen);
    textInputRef?.current?.focus();
  };

  const onInputClick = () => {
    if (!isSelectOpen) {
      setIsSelectOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const selectOption = (value, content) => {
    setInputValue(String(content));
    setFilterValue('');
    setSelected(String(value));
    closeMenu();
  };

  const onSelect = (_event, value) => {
    if (value) {
      if (value === CREATE_NEW) {
        // Create new plan with the filter value as the name
        const createdName = filterValue;
        setSelected(CREATE_NEW);
        setInputValue(createdName);
        setFilterValue('');
        // Persist the newly created option locally so it remains available
        if (createdName?.trim()) {
          setUserCreatedOptions((prev) => {
            const existsInPrev = prev.some(
              (o) => o.children.toLowerCase() === createdName.toLowerCase(),
            );
            const existsInApi = initialSelectOptions.some(
              (o) => o.children.toLowerCase() === createdName.toLowerCase(),
            );
            if (existsInPrev || existsInApi) {
              return prev;
            }
            return [
              ...prev,
              {
                children: createdName,
                value: `local-${createdName}`,
              },
            ];
          });
        }
        closeMenu();
      } else {
        const optionText = selectOptions.find(
          (option) => option.value === value,
        )?.children;
        selectOption(value, optionText);
      }
    }
  };

  const onTextInputChange = (_event, value) => {
    setInputValue(value);
    setFilterValue(value);
    resetActiveAndFocusedItem();

    if (value !== selected) {
      setSelected('');
    }
  };

  const handleMenuArrowKeys = (key) => {
    let indexToFocus = 0;

    if (!isSelectOpen) {
      setIsSelectOpen(true);
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      while (selectOptions[indexToFocus]?.isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
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

      while (selectOptions[indexToFocus]?.isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event) => {
    const focusedItem =
      focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (isSelectOpen && focusedItem && !focusedItem.isAriaDisabled) {
          onSelect(undefined, focusedItem.value);
        }
        if (!isSelectOpen) {
          setIsSelectOpen(true);
        }
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const handleClear = () => {
    setSelected('');
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  return {
    // State
    isSelectOpen,
    selected,
    inputValue,
    filterValue,
    selectOptions,
    focusedItemIndex,
    activeItemId,
    textInputRef,
    isExistingPlanSelected,
    CREATE_NEW,
    // Actions
    setIsSelectOpen,
    setSelected,
    setInputValue,
    onToggleClick,
    onInputClick,
    onSelect,
    onTextInputChange,
    onInputKeyDown,
    handleClear,
    closeMenu,
    createItemId,
  };
};
