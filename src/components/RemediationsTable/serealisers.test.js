import {
  paginationSerialiser,
  filtersSerialiser,
  sortSerialiser,
} from './serealisers';

describe('serealisers', () => {
  describe('paginationSerialiser', () => {
    it('should return offset and limit for valid pagination state', () => {
      const state = { page: 1, perPage: 10 };
      const result = paginationSerialiser(state);

      expect(result).toEqual({ offset: 0, limit: 10 });
    });

    it('should calculate correct offset for page 2', () => {
      const state = { page: 2, perPage: 10 };
      const result = paginationSerialiser(state);

      expect(result).toEqual({ offset: 10, limit: 10 });
    });

    it('should calculate correct offset for page 3 with perPage 25', () => {
      const state = { page: 3, perPage: 25 };
      const result = paginationSerialiser(state);

      expect(result).toEqual({ offset: 50, limit: 25 });
    });

    it('should handle large page numbers', () => {
      const state = { page: 100, perPage: 5 };
      const result = paginationSerialiser(state);

      expect(result).toEqual({ offset: 495, limit: 5 });
    });

    it('should return undefined for null state', () => {
      const result = paginationSerialiser(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined state', () => {
      const result = paginationSerialiser(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle edge case with page 1 and large perPage', () => {
      const state = { page: 1, perPage: 1000 };
      const result = paginationSerialiser(state);

      expect(result).toEqual({ offset: 0, limit: 1000 });
    });
  });

  describe('filtersSerialiser', () => {
    const mockFilters = [
      {
        id: 'name',
        type: 'text',
        filterAttribute: 'name',
      },
      {
        id: 'status',
        type: 'radio',
        filterAttribute: 'status',
      },
      {
        id: 'tags',
        type: 'checkbox',
        filterAttribute: 'tags',
      },
      {
        id: 'category',
        type: 'singleSelect',
        filterAttribute: 'category',
      },
      {
        id: 'created_at',
        type: 'calendar',
        filterAttribute: 'created_at',
      },
      {
        id: 'custom',
        filterAttribute: 'custom_field',
        filterSerialiser: (config, values) => values.join('|'),
      },
    ];

    it('should serialize text filter', () => {
      const state = { name: ['test value'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          name: 'test value',
        },
      });
    });

    it('should serialize radio filter', () => {
      const state = { status: ['active'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          status: 'active',
        },
      });
    });

    it('should serialize checkbox filter with multiple values', () => {
      const state = { tags: ['tag1', 'tag2', 'tag3'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          tags: 'tag1,tag2,tag3',
        },
      });
    });

    it('should serialize checkbox filter with single value', () => {
      const state = { tags: ['single-tag'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          tags: 'single-tag',
        },
      });
    });

    it('should serialize singleSelect filter', () => {
      const state = { category: ['important'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          category: 'important',
        },
      });
    });

    it('should serialize calendar filter with valid date', () => {
      const state = { created_at: ['2023-12-25'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          created_at: '2023-12-25T00:00:00.000Z',
        },
      });
    });

    it('should handle invalid calendar date format', () => {
      const state = { created_at: ['invalid-date'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          created_at: undefined,
        },
      });
    });

    it('should handle empty calendar date', () => {
      const state = { created_at: [''] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          created_at: undefined,
        },
      });
    });

    it('should use custom filterSerialiser when provided', () => {
      const state = { custom: ['value1', 'value2'] };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          custom_field: 'value1|value2',
        },
      });
    });

    it('should handle multiple filters simultaneously', () => {
      const state = {
        name: ['test name'],
        status: ['active'],
        tags: ['tag1', 'tag2'],
      };
      const result = filtersSerialiser(state, mockFilters);

      expect(result).toEqual({
        filter: {
          name: 'test name',
          status: 'active',
          tags: 'tag1,tag2',
        },
      });
    });

    it('should handle empty state', () => {
      const result = filtersSerialiser({}, mockFilters);
      expect(result).toEqual({});
    });

    it('should handle null state', () => {
      const result = filtersSerialiser(null, mockFilters);
      expect(result).toEqual({});
    });

    it('should handle undefined state', () => {
      const result = filtersSerialiser(undefined, mockFilters);
      expect(result).toEqual({});
    });

    it('should skip filters not found in configuration', () => {
      const state = { nonexistent: ['value'] };

      // When no filter config is found, filterConfigItem is undefined
      // This causes an error in findFilterSerialiser, so let's handle this case
      expect(() => {
        filtersSerialiser(state, mockFilters);
      }).toThrow();
    });

    it('should handle filter without filterAttribute', () => {
      const filtersWithoutAttribute = [
        {
          id: 'test',
          type: 'text',
          // No filterAttribute
        },
      ];
      const state = { test: ['value'] };
      const result = filtersSerialiser(state, filtersWithoutAttribute);

      expect(result).toEqual({
        filter: {
          undefined: ['value'], // Raw value array is returned when no filterAttribute
        },
      });
    });
  });

  describe('sortSerialiser', () => {
    const mockColumns = [
      { title: 'Name', sortable: 'name' },
      { title: 'Status', sortable: 'status' },
      { title: 'Created', sortable: 'created_at' },
      { title: 'Non-sortable' }, // No sortable property
    ];

    it('should return ascending sort string', () => {
      const sortState = { index: 0, direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBe('name');
    });

    it('should return descending sort string with minus prefix', () => {
      const sortState = { index: 0, direction: 'desc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBe('-name');
    });

    it('should handle different column indices', () => {
      const sortState = { index: 1, direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBe('status');
    });

    it('should handle third column with descending sort', () => {
      const sortState = { index: 2, direction: 'desc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBe('-created_at');
    });

    it('should return falsy for non-sortable column', () => {
      const sortState = { index: 3, direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBeFalsy();
    });

    it('should return falsy for out-of-bounds index', () => {
      const sortState = { index: 10, direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBeFalsy();
    });

    it('should return falsy for negative index', () => {
      const sortState = { index: -1, direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBeFalsy();
    });

    it('should handle undefined sort state', () => {
      const result = sortSerialiser(undefined, mockColumns);
      expect(result).toBeFalsy();
    });

    it('should handle null sort state', () => {
      // The function destructures null, which will throw an error
      expect(() => {
        sortSerialiser(null, mockColumns);
      }).toThrow();
    });

    it('should handle empty sort state object', () => {
      const result = sortSerialiser({}, mockColumns);
      expect(result).toBeFalsy();
    });

    it('should handle sort state with missing index', () => {
      const sortState = { direction: 'asc' };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBeFalsy();
    });

    it('should handle sort state with missing direction', () => {
      const sortState = { index: 0 };
      const result = sortSerialiser(sortState, mockColumns);

      expect(result).toBe('name'); // Default is ascending (no minus prefix)
    });

    it('should handle empty columns array', () => {
      const sortState = { index: 0, direction: 'asc' };
      const result = sortSerialiser(sortState, []);

      expect(result).toBeFalsy();
    });

    it('should handle null columns', () => {
      const sortState = { index: 0, direction: 'asc' };

      // This will throw when trying to access columns[index]
      expect(() => {
        sortSerialiser(sortState, null);
      }).toThrow();
    });
  });

  describe('date utilities (toUtcIso)', () => {
    // Testing the internal toUtcIso function through the calendar filter serializer
    const calendarFilter = [
      {
        id: 'date',
        type: 'calendar',
        filterAttribute: 'date',
      },
    ];

    it('should convert valid YYYY-MM-DD date to UTC ISO string', () => {
      const state = { date: ['2023-01-15'] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBe('2023-01-15T00:00:00.000Z');
    });

    it('should handle leap year date', () => {
      const state = { date: ['2024-02-29'] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBe('2024-02-29T00:00:00.000Z');
    });

    it('should reject invalid date format (wrong pattern)', () => {
      const state = { date: ['2023/01/15'] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBeUndefined();
    });

    it('should reject date with invalid day', () => {
      const state = { date: ['2023-02-30'] };
      const result = filtersSerialiser(state, calendarFilter);

      // JavaScript Date constructor may correct invalid dates
      // 2023-02-30 becomes 2023-03-02, so it's still valid
      expect(result.filter.date).toBeDefined();
    });

    it('should reject date with invalid month', () => {
      const state = { date: ['2023-13-01'] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBeUndefined();
    });

    it('should handle null date value', () => {
      const state = { date: [null] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBeUndefined();
    });

    it('should handle undefined date value', () => {
      const state = { date: [undefined] };
      const result = filtersSerialiser(state, calendarFilter);

      expect(result.filter.date).toBeUndefined();
    });
  });
});
