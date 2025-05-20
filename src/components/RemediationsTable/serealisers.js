export const paginationSerialiser = (state) => {
  if (state) {
    const offset = (state.page - 1) * state.perPage;
    const limit = state.perPage;

    return { offset, limit };
  }
};
const YYYY_MM_DD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toUtcIso = (yyyyMmDd) => {
  if (!yyyyMmDd) return undefined;

  if (!YYYY_MM_DD_REGEX.test(yyyyMmDd)) return undefined;
  const date = new Date(`${yyyyMmDd}T00:00:00Z`);
  if (isNaN(date.getTime())) return undefined;

  return date.toISOString();
};

const filterSerialisers = {
  text: (_config, [value]) => value,
  radio: (_config, [value]) => value,
  checkbox: (_config, values) => values.join(','),
  singleSelect: (_config, [value]) => value,
  calendar: (_config, [value]) => toUtcIso(value),
};

const findFilterSerialiser = (filterConfigItem) => {
  if (filterConfigItem.filterSerialiser) {
    return filterConfigItem.filterSerialiser;
  } else {
    return (
      filterConfigItem.filterAttribute &&
      filterSerialisers[filterConfigItem?.type]
    );
  }
};

/**
 * Takes an AsyncTableToolsTable state and transforms it into a Remediations scoped search filter parameter
 *
 *  @param   {object}             state   Table state
 *  @param   {object}             filters AsyncTableToolsTable filter configuration
 *
 *  @returns {string | undefined}         Remediations scoped search filter string
 *
 *  @category Remediations
 *  @tutorial filter-serialiser
 *
 */
export const filtersSerialiser = (state, filters) =>
  Object.entries(state || {}).reduce((allFilters, [filterId, value]) => {
    const filterConfigItem = filters.find((filter) => filter.id === filterId);
    const filterSerialiser = findFilterSerialiser(filterConfigItem);
    const serialiseValue = filterSerialiser
      ? filterSerialiser(filterConfigItem, value)
      : value;

    const filterParams = {
      ...allFilters,
      [`filter[${filterConfigItem.filterAttribute}]`]: serialiseValue,
    };
    return filterParams;
  }, {});
/**
 * Returns a string consumable by the Remediations API as a "sort_by" parameter for a given column and direction
 * For columns to be sortable they need to have a "sortable" prop, which corresponds to the field name in the Remediations API
 *
 *  @param   {object} state           A "sortBy" table state
 *  @param   {number} state.index     Index of the column to sort by
 *  @param   {string} state.direction Direction to sort the column by
 *  @param   {Array}  columns         Columns passed in for the AsyncTableToolsTable
 *
 *  @returns {string}                 Remediations "sort_by" parameter string, like "name:desc"
 *
 *  @category Remediations
 *
 *  @example <caption>Example of a column with an sortable property</caption>
 *
 *  const columns = [
 *     {
 *       title: 'Name',
 *       sortable: 'name' // Corresponds to the attribute/field to sort by in the API
 *     }
 *  ];
 *
 */
export const sortSerialiser = ({ index, direction } = {}, columns) => {
  return (
    columns[index]?.sortable &&
    `${direction === 'desc' ? '-' : ''}${columns[index].sortable}`
  );
};
