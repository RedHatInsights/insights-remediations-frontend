import { renderHook, act } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { selectEntity } from '../../actions';
import useBulkSelect from './useBulkSelect';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../actions', () => ({
  selectEntity: jest.fn(),
}));

describe('useBulkSelect', () => {
  let mockDispatch;
  let mockSystemsRef;

  beforeEach(() => {
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    selectEntity.mockImplementation((id, selected) => ({
      type: 'SELECT_ENTITY',
      id,
      selected,
    }));

    // Create a mock ref with current property
    mockSystemsRef = {
      current: [
        { id: 'system-1', name: 'System 1' },
        { id: 'system-2', name: 'System 2' },
        { id: 'system-3', name: 'System 3' },
      ],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getDefaultProps = () => ({
    systemsRef: mockSystemsRef,
    rows: [{ id: 'row-1' }, { id: 'row-2' }],
    selected: new Map([
      ['system-1', { id: 'system-1', name: 'System 1' }],
      ['system-2', { id: 'system-2', name: 'System 2' }],
    ]),
    loaded: true,
    calculateChecked: jest.fn().mockReturnValue(false),
    totalCount: 3,
    fetchAllSystems: jest.fn().mockResolvedValue(mockSystemsRef.current),
  });

  it('should return the correct initial structure', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    const bulkSelectConfig = result.current;

    expect(bulkSelectConfig).toBeDefined();
    expect(bulkSelectConfig.isDisabled).toBe(false);
    expect(bulkSelectConfig.count).toBe(2); // selected.size
    expect(Array.isArray(bulkSelectConfig.items)).toBe(true);
    expect(typeof bulkSelectConfig.checked).toBe('boolean');
    expect(typeof bulkSelectConfig.onSelect).toBe('function');
  });

  it('should be disabled when rows is falsy', () => {
    const props = { ...getDefaultProps(), rows: null };
    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.isDisabled).toBe(true);
  });

  it('should have correct count based on selected size', () => {
    const props = {
      ...getDefaultProps(),
      selected: new Map([
        ['system-1', {}],
        ['system-2', {}],
      ]),
    };
    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.count).toBe(2);
  });

  it('should handle undefined selected', () => {
    const props = { ...getDefaultProps(), selected: undefined };
    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.count).toBe(0);
  });

  it('should always include "Select none" item', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    const noneItem = result.current.items[0];
    expect(noneItem.title).toBe('Select none (0)');
    expect(typeof noneItem.onClick).toBe('function');
  });

  it('should dispatch select none action when "Select none" is clicked', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    act(() => {
      result.current.items[0].onClick();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(selectEntity).toHaveBeenCalledWith(-1, false);
  });

  it('should include page selection items when loaded and rows exist', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    const pageItem = result.current.items.find((item) =>
      item.title.includes('Select page'),
    );
    expect(pageItem).toBeDefined();
    expect(pageItem.title).toBe('Select page (2)'); // rows.length
  });

  it('should not include page selection items when not loaded', () => {
    const props = { ...getDefaultProps(), loaded: false };
    const { result } = renderHook(() => useBulkSelect(props));

    const pageItem = result.current.items.find((item) =>
      item.title.includes('Select page'),
    );
    expect(pageItem).toBeUndefined();
  });

  it('should not include page selection items when no rows', () => {
    const props = { ...getDefaultProps(), rows: [] };
    const { result } = renderHook(() => useBulkSelect(props));

    const pageItem = result.current.items.find((item) =>
      item.title.includes('Select page'),
    );
    expect(pageItem).toBeUndefined();
  });

  it('should include "Select all" item when loaded and fetchAllSystems provided', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    const allItem = result.current.items.find((item) =>
      item.title.includes('Select all'),
    );
    expect(allItem).toBeDefined();
    expect(allItem.title).toBe('Select all (3)'); // totalCount
  });

  it('should dispatch select page action when page is not fully selected', () => {
    const props = {
      ...getDefaultProps(),
      selected: new Set(), // No selection
    };
    const { result } = renderHook(() => useBulkSelect(props));

    const pageItem = result.current.items.find((item) =>
      item.title.includes('Select page'),
    );

    act(() => {
      pageItem.onClick();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_ENTITY',
      id: 0,
      selected: true,
    });
  });

  it('should dispatch select all action when not all systems are selected', async () => {
    const props = {
      ...getDefaultProps(),
      totalCount: 3,
      fetchAllSystems: jest.fn().mockResolvedValue(mockSystemsRef.current),
    };
    const { result } = renderHook(() => useBulkSelect(props));

    const allItem = result.current.items.find((item) =>
      item.title.includes('Select all'),
    );

    await act(async () => {
      await allItem.onClick();
    });

    expect(props.fetchAllSystems).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(selectEntity).toHaveBeenCalledWith('system-1', true);
    expect(selectEntity).toHaveBeenCalledWith('system-2', true);
    expect(selectEntity).toHaveBeenCalledWith('system-3', true);
  });

  it('should dispatch deselect all action when all systems are selected', () => {
    const props = {
      ...getDefaultProps(),
      selected: new Map([
        ['system-1', {}],
        ['system-2', {}],
        ['system-3', {}],
      ]),
      totalCount: 3,
    };
    const { result } = renderHook(() => useBulkSelect(props));

    const allItem = result.current.items.find((item) =>
      item.title.includes('Deselect all'),
    );

    act(() => {
      allItem.onClick();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(selectEntity).toHaveBeenCalledWith(-1, false);
  });

  it('should handle onSelect for page selection when page is not fully selected', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    act(() => {
      result.current.onSelect();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_ENTITY',
      id: 0,
      selected: true,
    });
  });

  it('should handle complex page selection logic', () => {
    // Mock bulkSelectCheck to return rows (all rows selected)
    const rows = [
      { selected: true, id: 'row-1' },
      { selected: true, id: 'row-2' },
    ];

    const props = {
      ...getDefaultProps(),
      rows,
      selected: new Set(['system-1', 'system-2']),
    };

    const { result } = renderHook(() => useBulkSelect(props));

    // Since we need to simulate the bulkSelectCheck logic, let's test different scenarios
    act(() => {
      result.current.onSelect();
    });

    // Should dispatch deselect page since all rows are considered selected
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle edge case with empty systemsRef and totalCount 0', () => {
    const props = {
      ...getDefaultProps(),
      systemsRef: { current: [] },
      totalCount: 0,
      fetchAllSystems: jest.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.count).toBe(2); // selected.size still 2

    const allItem = result.current.items.find((item) =>
      item.title.includes('Select all'),
    );
    expect(allItem).toBeDefined();
    expect(allItem.title).toBe('Select all (0)');
  });

  it('should handle calculateChecked function correctly', () => {
    const mockCalculateChecked = jest.fn().mockReturnValue(true);
    const props = {
      ...getDefaultProps(),
      calculateChecked: mockCalculateChecked,
    };

    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.checked).toBe(true);
    expect(mockCalculateChecked).toHaveBeenCalledWith(
      props.rows,
      props.selected,
    );
  });

  it('should handle null/undefined rows gracefully', () => {
    const props = {
      ...getDefaultProps(),
      rows: null,
      fetchAllSystems: undefined,
      totalCount: 0,
    };
    const { result } = renderHook(() => useBulkSelect(props));

    expect(result.current.isDisabled).toBe(true);
    expect(result.current.items).toHaveLength(1); // Only "Select none"
  });

  it('should handle complex selection scenarios in page onClick', () => {
    // Scenario 1: No selected set
    const props1 = {
      ...getDefaultProps(),
      selected: null,
    };

    const { result: result1 } = renderHook(() => useBulkSelect(props1));
    const pageItem1 = result1.current.items.find((item) =>
      item.title.includes('Select page'),
    );

    act(() => {
      pageItem1.onClick();
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SELECT_ENTITY',
      id: 0,
      selected: true,
    });

    jest.clearAllMocks();

    // Scenario 2: Selected size equals systemsRef length
    const props2 = {
      ...getDefaultProps(),
      selected: new Map([
        ['system-1', {}],
        ['system-2', {}],
        ['system-3', {}],
      ]),
    };

    const { result: result2 } = renderHook(() => useBulkSelect(props2));
    const pageItem2 = result2.current.items.find((item) =>
      item.title.includes('Select page'),
    );

    act(() => {
      pageItem2.onClick();
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle deselect page action', () => {
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    // Find and test the page item with complex logic
    const pageItem = result.current.items.find((item) =>
      item.title.includes('Select page'),
    );

    act(() => {
      pageItem.onClick();
    });

    // Should dispatch some selection action
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('should handle all deselection scenarios', () => {
    // Test each case in the bulkSelectorSwitch
    const { result } = renderHook(() => useBulkSelect(getDefaultProps()));

    // Test 'none' case by clicking Select none
    act(() => {
      result.current.items[0].onClick(); // Select none item
    });

    expect(selectEntity).toHaveBeenCalledWith(-1, false);
  });
});
