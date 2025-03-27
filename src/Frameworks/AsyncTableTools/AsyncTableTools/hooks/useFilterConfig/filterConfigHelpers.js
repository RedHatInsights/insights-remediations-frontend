import { defaultPlaceholder, stringToId } from './helpers';
import filterTypeHelpers from './filterTypeHelpers';
import { conditionalFilterType } from '@redhat-cloud-services/frontend-components/ConditionalFilter';

const isCustomFilter = (type) =>
  !Object.keys(conditionalFilterType).includes(type);

const getActiveFilters = (configItem, activeFilters, customFilterTypes) =>
  filterTypeHelpers(
    configItem.type,
    customFilterTypes
  )?.getActiveFilterValues?.(configItem, activeFilters) ||
  activeFilters?.[stringToId(configItem.label)];

const toFilterConfigItem = (
  configItem,
  handler,
  activeFilters,
  customFilterTypes
) => {
  const value = getActiveFilters(configItem, activeFilters, customFilterTypes);
  const filterValues = filterTypeHelpers(
    configItem.type,
    customFilterTypes
  )?.filterValues(configItem, handler, value);

  return filterValues
    ? {
        type: isCustomFilter(configItem.type)
          ? conditionalFilterType.custom
          : configItem.type,
        label: configItem.label,
        className: configItem.className, // TODO questionable... maybe add a props prop
        placeholder:
          configItem?.placeholder ?? defaultPlaceholder(configItem.label),
        filterValues,
      }
    : undefined;
};

export const toIdedFilters = (configItem) => ({
  ...configItem,
  id: stringToId(configItem.label),
});

export const toFilterConfig = (
  filterConfig,
  activeFilters,
  handler,
  customFilterTypes
) => ({
  items: filterConfig
    .map(toIdedFilters)
    .map((configItem) =>
      toFilterConfigItem(configItem, handler, activeFilters, customFilterTypes)
    )
    .filter((v) => !!v),
});

export const getFilterConfigItem = (filterConfig, filter) =>
  filterConfig.find(
    (configItem) => stringToId(configItem.label) === stringToId(filter)
  );

export const toSelectValue = (
  filterConfig,
  filter,
  selectedValue,
  selectedValues
) => {
  const configItem = getFilterConfigItem(filterConfig, filter);
  return filterTypeHelpers(configItem.type).toSelectValue(
    configItem,
    selectedValues,
    selectedValue
  );
};
