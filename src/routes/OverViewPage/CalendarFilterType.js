import CalendarFilter from '../CalendarFilter';

export const CalendarFilterType = {
  Component: CalendarFilter,
  chips: (value = []) => {
    console.log(value, 'value here');
    return value.length ? [value[0].slice(0, 10)] : [];
  },

  selectValue: (selectedValue) => {
    console.log(selectedValue, 'selectedValue here');

    return [[selectedValue], true];
  },
  deselectValue: () => [undefined, true],
};
