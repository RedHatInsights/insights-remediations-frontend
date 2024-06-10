import {
  calculateChecked,
  calculateSystems,
  fetchInventoryData,
} from './helpers';

const mockData = [
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
  it('should return false', () => {
    expect(calculateChecked([], new Map())).toBe(false);
    expect(calculateChecked([{ id: '1' }], new Map([['2', 'bla']]))).toBe(
      false
    );
  });

  it('should return true', () => {
    expect(calculateChecked([{ id: '1' }], new Map([['1', 'bla']]))).toBe(true);
  });

  it('should return null', () => {
    expect(
      calculateChecked([{ id: '1' }, { id: '2' }], new Map([['2', 'bla']]))
    ).toBe(null);
  });
});

describe('calculateSystems', () => {
  it('should calculate empty array', () => {
    expect(calculateSystems().length).toBe(0);
  });

  it('should work with issues without systems', () => {
    const systems = calculateSystems({
      issues: [{ systems: [{ id: 'some' }] }, {}],
    });
    expect(systems.length).toBe(1);
    expect(systems).toMatchObject([
      {
        id: 'some',
        issues: [{ id: undefined }],
        rebootRequired: undefined,
      },
    ]);
  });

  it('should merge issues to one system', () => {
    const systems = calculateSystems({
      issues: [
        { id: 'one', systems: [{ id: 'some' }] },
        { id: 'two', systems: [{ id: 'some' }] },
      ],
    });
    expect(systems.length).toBe(1);
    expect(systems).toMatchObject([
      {
        id: 'some',
        issues: [{ id: 'one' }, { id: 'two' }],
        rebootRequired: false,
      },
    ]);
  });

  it('should merge issues to one system - with reboot', () => {
    const systems = calculateSystems({
      issues: [
        { id: 'one', systems: [{ id: 'some' }] },
        {
          id: 'two',
          systems: [{ id: 'some' }],
          resolution: { needs_reboot: true },
        },
      ],
    });
    expect(systems.length).toBe(1);
    expect(systems).toMatchObject([
      {
        id: 'some',
        issues: [{ id: 'one' }, { id: 'two' }],
        rebootRequired: true,
      },
    ]);
  });
});

describe('fetchInventoryData', () => {
  it('should map systems', async () => {
    const getFn = jest.fn(() => ({ results: [{ id: 'one' }] }));
    const data = await fetchInventoryData(
      { per_page: 10 },
      [{ id: 'one' }],
      getFn,
      mockData
    );
    expect(getFn).toHaveBeenCalled();
    expect(data).toMatchObject({
      results: [{ id: 'one' }],
      total: 1,
    });
  });
  it('should filter', async () => {
    const getFn = jest.fn(() => ({ results: [{ id: 'one' }] }));
    const data = await fetchInventoryData(
      {
        per_page: 10,
        filters: {
          hostnameOrId: 'f',
        },
      },
      [
        { id: 'one', display_name: 'foo' },
        { id: 'two', display_name: 'bar' },
      ],
      getFn,
      mockData
    );
    expect(getFn).toHaveBeenCalled();
    expect(data).toMatchObject({
      results: [{ id: 'one', display_name: 'foo' }],
      total: 1,
    });
  });
  it('should paginate', async () => {
    const getFn = jest.fn(() => ({ results: [{ id: 'one' }] }));
    const data = await fetchInventoryData(
      {
        per_page: 1,
      },
      [
        { id: 'one', display_name: 'foo' },
        { id: 'two', display_name: 'bar' },
      ],
      getFn,
      mockData
    );
    expect(getFn).toHaveBeenCalled();
    expect(data).toMatchObject({
      results: [{ id: 'one', display_name: 'foo' }],
      total: 2,
    });
  });
});
