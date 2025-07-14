import CalendarFilter from '../CalendarFilter';

export const CalendarFilterType = {
  Component: CalendarFilter,
  chips: (value = []) => {
    return value.length ? [value[0].slice(0, 10)] : [];
  },

  selectValue: (selectedValue) => {
    return [[selectedValue], true];
  },
  deselectValue: () => [undefined, true],
};
