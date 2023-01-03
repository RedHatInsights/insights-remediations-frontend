import { useState } from 'react';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

const filters = {
  name: {
    label: 'Name',
    placeholder: 'Filter by name',
  },
};

export const buildChips = (activeFilters = []) => {
  const chips = activeFilters
    .map((filter) => {
      let chip;
      Object.entries(filter).forEach(([key, values]) => {
        if (values) {
          const chipValues = Array.isArray(values) ? values : [values];
          chip = {
            category: filters[key].label,
            name: filters[key].label,
            chips: chipValues.map((value) => ({
              name: value,
            })),
          };
        }
      });

      return chip;
    })
    .filter((filter) => !!filter);

  return chips;
};

const useNameFilter = (apply) => {
  const [name, setName] = useState();

  const removeName = () => setName(undefined);
  return [
    name,
    removeName,
    {
      value: 'display_name',
      label: filters.name.label,
      filterValues: {
        placeholder: filters.name.placeholder,
        type: conditionalFilterType.text,
        value: name,
        onChange: (e, selected) => {
          setName(selected);
          apply(selected);
        },
      },
    },
  ];
};

export default useNameFilter;
