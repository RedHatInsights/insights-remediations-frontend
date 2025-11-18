import {
  calculateChecked,
  calculateSystems,
  fetchInventoryData,
} from './helpers';

const mockConnectedData = [
  {
    endpoint_id: null,
    executor_id: null,
    executor_type: 'None',
    executor_name: null,
    system_count: 1,
    system_ids: ['1'],
    connection_status: 'no_rhc',
  },
];

describe('calculateChecked', () => {
  it('should return false for empty rows or no matching selection', () => {
    expect(calculateChecked([], new Map())).toBe(false);
    expect(calculateChecked([{ id: '1' }], new Map([['2', 'bla']]))).toBe(
      false,
    );
  });

  it('should return true when all rows are selected', () => {
    expect(calculateChecked([{ id: '1' }], new Map([['1', 'bla']]))).toBe(true);
  });

  it('should return null when some but not all rows are selected', () => {
    expect(
      calculateChecked([{ id: '1' }, { id: '2' }], new Map([['2', 'bla']])),
    ).toBe(null);
  });
});

describe('calculateSystems', () => {
  it('should return empty array when systemsData is undefined', () => {
    expect(calculateSystems().length).toBe(0);
  });

  it('should map system data to simplified structure', () => {
    const systemsData = [
      {
        id: 'system-1',
        hostname: 'host1.example.com',
        display_name: 'Host 1',
        issue_count: 3,
      },
      {
        id: 'system-2',
        hostname: 'host2.example.com',
        display_name: 'Host 2',
        issue_count: 1,
      },
    ];

    const result = calculateSystems(systemsData);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        id: 'system-1',
        hostname: 'host1.example.com',
        display_name: 'Host 1',
        issue_count: 3,
      },
      {
        id: 'system-2',
        hostname: 'host2.example.com',
        display_name: 'Host 2',
        issue_count: 1,
      },
    ]);
  });

  it('should handle null systemsData', () => {
    expect(calculateSystems(null)).toEqual([]);
  });

  it('should only include expected fields', () => {
    const systemsData = [
      {
        id: 'system-1',
        hostname: 'host1.example.com',
        display_name: 'Host 1',
        issue_count: 3,
        extra_field: 'should be ignored',
      },
    ];

    const result = calculateSystems(systemsData);

    expect(result[0]).toEqual({
      id: 'system-1',
      hostname: 'host1.example.com',
      display_name: 'Host 1',
      issue_count: 3,
    });
    expect(result[0]).not.toHaveProperty('extra_field');
  });
});

describe('fetchInventoryData', () => {
  it('should fetch and map systems', async () => {
    const getEntities = jest.fn(() => ({ results: [{ id: 'system-1' }] }));
    const fetchSystems = jest.fn(() => ({
      data: [
        {
          id: 'system-1',
          hostname: 'host1.example.com',
          display_name: 'Host 1',
          issue_count: 2,
        },
      ],
      meta: { total: 1 },
    }));

    const data = await fetchInventoryData(
      { per_page: 10 },
      fetchSystems,
      'remediation-1',
      getEntities,
      mockConnectedData,
    );

    expect(fetchSystems).toHaveBeenCalledWith({
      id: 'remediation-1',
      limit: 10,
      offset: 0,
      sort: 'display_name',
    });
    expect(getEntities).toHaveBeenCalled();
    expect(data).toMatchObject({
      results: [{ id: 'system-1' }],
      total: 1,
    });
  });

  it('should apply hostname filter', async () => {
    const getEntities = jest.fn(() => ({ results: [{ id: 'system-1' }] }));
    const fetchSystems = jest.fn(() => ({
      data: [
        {
          id: 'system-1',
          hostname: 'foo.example.com',
          display_name: 'Foo System',
          issue_count: 1,
        },
      ],
      meta: { total: 1 },
    }));

    const data = await fetchInventoryData(
      {
        per_page: 10,
        filters: {
          hostnameOrId: 'foo',
        },
      },
      fetchSystems,
      'remediation-1',
      getEntities,
      mockConnectedData,
    );

    expect(fetchSystems).toHaveBeenCalledWith({
      id: 'remediation-1',
      limit: 10,
      offset: 0,
      sort: 'display_name',
      filter: { display_name: 'foo' },
    });
    expect(getEntities).toHaveBeenCalled();
    expect(data).toMatchObject({
      results: [{ id: 'system-1' }],
      total: 1,
    });
  });

  it('should paginate correctly', async () => {
    const getEntities = jest.fn(() => ({ results: [{ id: 'system-1' }] }));
    const fetchSystems = jest.fn(() => ({
      data: [
        {
          id: 'system-1',
          hostname: 'host1.example.com',
          display_name: 'Host 1',
          issue_count: 1,
        },
      ],
      meta: { total: 10 },
    }));

    const data = await fetchInventoryData(
      {
        page: 2,
        per_page: 1,
      },
      fetchSystems,
      'remediation-1',
      getEntities,
      mockConnectedData,
    );

    expect(fetchSystems).toHaveBeenCalledWith({
      id: 'remediation-1',
      limit: 1,
      offset: 1, // page 2, per_page 1 = offset 1
      sort: 'display_name',
    });
    expect(data).toMatchObject({
      results: [{ id: 'system-1' }],
      total: 10,
    });
  });

  it('should handle empty results', async () => {
    const getEntities = jest.fn(() => ({ results: [] }));
    const fetchSystems = jest.fn(() => ({
      data: [],
      meta: { total: 0 },
    }));

    const data = await fetchInventoryData(
      { per_page: 10 },
      fetchSystems,
      'remediation-1',
      getEntities,
      mockConnectedData,
    );

    expect(data).toMatchObject({
      results: [],
      total: 0,
    });
  });

  it('should handle missing meta total', async () => {
    const getEntities = jest.fn(() => ({ results: [{ id: 'system-1' }] }));
    const fetchSystems = jest.fn(() => ({
      data: [
        {
          id: 'system-1',
          hostname: 'host1.example.com',
          display_name: 'Host 1',
          issue_count: 1,
        },
      ],
      meta: {}, // No total
    }));

    const data = await fetchInventoryData(
      { per_page: 10 },
      fetchSystems,
      'remediation-1',
      getEntities,
      mockConnectedData,
    );

    expect(data.total).toBe(0); // Should default to 0
  });
});
